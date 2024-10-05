use futures::StreamExt;
use hyper::{Body, Client, Request, Response, Uri, StatusCode, Server};
use ratelimit_meter::{DirectRateLimiter, GCRA};
use serde::Deserialize;
use std::collections::HashMap;
use std::convert::Infallible;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock};
use hyper::service::{make_service_fn, service_fn};
use tokio_tungstenite::{accept_async, tungstenite::protocol::Message};
use std::num::NonZeroU32;
use std::collections::hash_map::Entry;
use std::time::{Duration, SystemTime};

const TOO_MANY_REQUESTS_HTML: &str = include_str!("templates/too_many_requests.html");
const SERVICE_UNAVAILABLE_HTML: &str = include_str!("templates/service_unavailable.html");

#[derive(Deserialize)]
struct CreateProxyData{
    external_port: u16,
    internal_port: u16,
    ip_address: String,
}

struct ProxyManager{
    proxies: HashMap<String, tokio::task::JoinHandle<()>>,
}

impl ProxyManager {
    fn new() -> Self{
        ProxyManager{
            proxies: HashMap::new(),
        }
    }

    fn create_proxy(&mut self, port: String, handle: tokio::task::JoinHandle<()>){
        self.proxies.insert(port, handle);
    }

    fn delete_proxy(&mut self, port: &str){
        if let Some(handle) = self.proxies.remove(port){
            handle.abort();
            println!("@network-gateway: Reverse proxy on port {} has been deleted.", port);
        }
    }
}

type SharedProxyManager = Arc<RwLock<ProxyManager>>;

struct AppState{
    proxy_manager: SharedProxyManager,
    rate_limiters: Arc<Mutex<HashMap<String, DirectRateLimiter<GCRA>>>>,
    blocked_ips: Arc<Mutex<HashMap<String, SystemTime>>>,
    too_many_requests_html: Arc<String>,
    service_unavailable_html: Arc<String>,
    client: Client<hyper::client::HttpConnector>,
}

impl AppState{
    fn new(
        proxy_manager: SharedProxyManager,
        too_many_requests_html: Arc<String>,
        service_unavailable_html: Arc<String>,
        client: Client<hyper::client::HttpConnector>,
    ) -> Self{
        AppState{
            proxy_manager,
            rate_limiters: Arc::new(Mutex::new(HashMap::new())),
            blocked_ips: Arc::new(Mutex::new(HashMap::new())),
            too_many_requests_html,
            service_unavailable_html,
            client,
        }
    }
}

async fn start_websocket_server(state: Arc<AppState>) -> Result<(), Box<dyn std::error::Error>>{
    let listener = tokio::net::TcpListener::bind("0.0.0.0:10000").await?;
    println!("@network-gateway: WebSocket server listening at ws://0.0.0.0:10000");

    while let Ok((stream, _)) = listener.accept().await{
        let ws_stream = match accept_async(stream).await{
            Ok(ws) => ws,
            Err(e) => {
                eprintln!("@network-gateway: Failed to accept WebSocket connection: {}", e);
                continue;
            },
        };
        let state = state.clone();
        tokio::spawn(async move{
            let (_write, mut read) = ws_stream.split();
            while let Some(message) = read.next().await{
                if let Ok(msg) = message {
                    handle_ws_message(msg, state.clone()).await;
                }
            }
        });
    }

    Ok(())
}

async fn proxy_request(
    req: Request<Body>,
    client_ip: String,
    remote_ip: String,
    port: u16,
    state: Arc<AppState>,
) -> Result<Response<Body>, hyper::Error>{
    let mut limiters_guard = state.rate_limiters.lock().await;
    let mut blocked_ips_guard = state.blocked_ips.lock().await;

    if let Some(&block_until) = blocked_ips_guard.get(&client_ip){
        let now = SystemTime::now();
        if now < block_until{
            // println!("@network-gateway: IP {} is blocked until {:?}", client_ip, block_until);
            return Ok(Response::builder()
                .status(StatusCode::TOO_MANY_REQUESTS)
                .header("Content-Type", "text/html")
                .header("Server", "QuantumCloud")
                .body(Body::from((*state.too_many_requests_html).clone()))
                .unwrap());
        }else{
            println!("@network-gateway: IP {} unblocked", client_ip);
            blocked_ips_guard.remove(&client_ip);
        }
    }

    let limiter = match limiters_guard.entry(client_ip.clone()){
        Entry::Occupied(entry) => entry.into_mut(),
        Entry::Vacant(entry) => {
            // println!("@network-gateway: Creating new rate limiter for IP {}", client_ip);
            entry.insert(DirectRateLimiter::<GCRA>::new(
                NonZeroU32::new(100).unwrap(),
                Duration::from_secs(60),
            ))
        }
    };

    match limiter.check(){
        Ok(_) => {
            // println!("@network-gateway: Request allowed for IP {}", client_ip)
        },
        Err(_) => {
            let block_time = SystemTime::now() + Duration::from_secs(60);
            blocked_ips_guard.insert(client_ip.clone(), block_time);

            // println!("@network-gateway: Rate limit exceeded for IP {}. Blocked until {:?}", client_ip, block_time);
            return Ok(Response::builder()
                .status(StatusCode::TOO_MANY_REQUESTS)
                .header("Content-Type", "text/html")
                .header("Server", "QuantumCloud")
                .body(Body::from((*state.too_many_requests_html).clone()))
                .unwrap());
        }
    }

    drop(limiters_guard);
    drop(blocked_ips_guard);

    let remote_server = format!("http://{}:{}", remote_ip, port);
    let uri_string = format!("{}{}", remote_server, req.uri().path_and_query().map(|x| x.as_str()).unwrap_or(""));

    let uri = match uri_string.parse::<Uri>(){
        Ok(parsed_uri) => parsed_uri,
        Err(_) => {
            return Ok(Response::builder()
                .status(StatusCode::SERVICE_UNAVAILABLE)
                .header("Content-Type", "text/html")
                .header("Server", "QuantumCloud")
                .body(Body::from((*state.service_unavailable_html).clone()))
                .unwrap());
        }
    };

    let client = &state.client;
    let headers = req.headers().clone();

    let mut proxy_req = match Request::builder()
        .method(req.method())
        .uri(uri)
        .body(req.into_body())
    {
        Ok(req) => req,
        Err(_) => {
            return Ok(Response::builder()
                .status(StatusCode::SERVICE_UNAVAILABLE)
                .header("Content-Type", "text/html")
                .header("Server", "QuantumCloud")
                .body(Body::from((*state.service_unavailable_html).clone()))
                .unwrap());
        }
    };

    *proxy_req.headers_mut() = headers;

    match client.request(proxy_req).await{
        Ok(mut response) => {
            response.headers_mut().insert(
                hyper::header::SERVER,
                hyper::header::HeaderValue::from_static("QuantumCloud"),
            );
            Ok(response)
        },
        Err(_) => Ok(Response::builder()
            .status(StatusCode::SERVICE_UNAVAILABLE)
            .header("Content-Type", "text/html")
            .header("Server", "QuantumCloud")
            .body(Body::from((*state.service_unavailable_html).clone()))
            .unwrap()),
    }
}

async fn handle_ws_message(msg: Message, state: Arc<AppState>){
    if let Ok(text) = msg.to_text(){
        let value: serde_json::Value = match serde_json::from_str(text){
            Ok(val) => val,
            Err(_) => {
                eprintln!("@network-gateway: Invalid JSON message received.");
                return;
            },
        };
        let event_type = value.get("event").and_then(|e| e.as_str());

        match event_type {
            Some("createReverseProxy") => {
                let data: CreateProxyData = match serde_json::from_value(value["data"].clone()) {
                    Ok(d) => d,
                    Err(_) => {
                        eprintln!("@network-gateway: Failed to deserialize createReverseProxy data.");
                        return;
                    },
                };
                create_reverse_proxy(data.external_port, data.ip_address, data.internal_port, state.clone()).await;
            }
            Some("deleteReverseProxy") => {
                let data: CreateProxyData = match serde_json::from_value(value["data"].clone()) {
                    Ok(d) => d,
                    Err(_) => {
                        eprintln!("@network-gateway: Failed to deserialize deleteReverseProxy data.");
                        return;
                    },
                };
                delete_reverse_proxy(data.external_port, state.clone()).await;
            }
            _ => eprintln!("@network-gateway: Unknown event type received."),
        }
    }
}

async fn create_reverse_proxy(
    port: u16,
    ip: String,
    internal_port: u16,
    state: Arc<AppState>,
){
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let state_clone = state.clone();
    let ip_clone = ip.clone();

    let make_svc = make_service_fn(move |conn: &hyper::server::conn::AddrStream|{
        let client_ip = conn.remote_addr().ip().to_string();
        let state = state_clone.clone();
        let remote_ip = ip_clone.clone();
        async move {
            Ok::<_, Infallible>(service_fn(move |req| {
                let client_ip = client_ip.clone();
                let state = state.clone();
                let remote_ip = remote_ip.clone();
                proxy_request(req, client_ip, remote_ip, internal_port, state)
            }))
        }
    });

    let server = Server::bind(&addr).serve(make_svc);

    let handle = tokio::spawn(async move {
        if let Err(e) = server.await{
            eprintln!("@network-gateway: Reverse proxy error on port {}: {}", port, e);
        }
    });

    let mut manager_guard = state.proxy_manager.write().await;
    manager_guard.create_proxy(port.to_string(), handle);
    println!("@network-gateway: Reverse proxy created on port {} pointing to {}:{}", port, ip, internal_port);
}

async fn delete_reverse_proxy(external_port: u16, state: Arc<AppState>){
    let port_str = external_port.to_string();
    let mut manager_guard = state.proxy_manager.write().await;
    if manager_guard.proxies.contains_key(&port_str) {
        manager_guard.delete_proxy(&port_str);
        println!("@network-gateway: Reverse proxy on port {} deleted.", external_port);
    } else {
        eprintln!("@network-gateway: No reverse proxy found on port {}.", external_port);
    }
}

#[tokio::main(flavor = "multi_thread")]
async fn main(){
    let num_threads = num_cpus::get();
    println!("@network-gateway: Detected {} CPU cores.", num_threads);

    let proxy_manager = Arc::new(RwLock::new(ProxyManager::new()));
    let client = Client::new();

    let state = Arc::new(AppState::new(
        proxy_manager,
        Arc::new(TOO_MANY_REQUESTS_HTML.to_string()),
        Arc::new(SERVICE_UNAVAILABLE_HTML.to_string()),
        client,
    ));

    if let Err(e) = start_websocket_server(state.clone()).await{
        eprintln!("@network-gateway: Failed to start WebSocket server: {}", e);
    }
}
