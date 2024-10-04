use futures::{StreamExt};
use hyper::{Body, Client, Request, Response, Server, Uri, StatusCode};
use hyper::service::{make_service_fn, service_fn};
use serde::{Deserialize};
use std::collections::HashMap;
use std::convert::Infallible;
use std::net::SocketAddr;
use std::sync::{Arc, RwLock};
use tokio::net::TcpListener;
use tokio::fs;

use tokio_tungstenite::{accept_async, tungstenite::protocol::Message};

#[derive(Deserialize)]
struct CreateProxyData{
    external_port: u16,
    internal_port: u16,
    ip_address: String,
}

struct ProxyManager{
    proxies: HashMap<String, tokio::task::JoinHandle<()>>,
}

impl ProxyManager{
    fn new() -> Self{
        ProxyManager{
            proxies: HashMap::new(),
        }
    }

    fn create_proxy(&mut self, port: u16, handle: tokio::task::JoinHandle<()>){
        self.proxies.insert(port.to_string(), handle);
    }

    fn delete_proxy(&mut self, port: String){
        if let Some(handle) = self.proxies.remove(&port){
            handle.abort();
            println!("@network-gateway/main.rs: Proxy on port {} deleted successfully", port);
        }else{
            println!("@network-gateway/main.rs: Proxy on port {} not found", port);
        }
    }
}

type SharedProxyManager = Arc<RwLock<ProxyManager>>;

async fn create_reverse_proxy(port: u16, ip: String, internal_port: u16, manager: SharedProxyManager){
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let make_svc = make_service_fn(move |_conn|{
        let ip = ip.clone();
        async move{
            Ok::<_, Infallible>(service_fn(move |req|{
                proxy_request(req, ip.clone(), internal_port)
            }))
        }
    });

    let server = Server::bind(&addr).serve(make_svc);
    let handle = tokio::spawn(async move{
        if let Err(e) = server.await{
            eprintln!("@network-gateway/main.rs: Error in proxy server: {}", e);
        }
    });

    let mut manager_guard = manager.write().unwrap();
    manager_guard.create_proxy(port, handle);
}

async fn render_service_unavailable() -> Result<Response<Body>, hyper::Error>{
    match fs::read_to_string("src/service_unavailable.html").await {
        Ok(html_content) => {
            let response = Response::builder()
                .status(StatusCode::SERVICE_UNAVAILABLE)
                .header("Content-Type", "text/html")
                .header("Server", "QuantumCloud")
                .body(Body::from(html_content))
                .unwrap();
            Ok(response)
        },
        Err(_) => {
            let fallback_response = Response::builder()
                .status(StatusCode::SERVICE_UNAVAILABLE)
                .header("Content-Type", "text/html")
                .header("Server", "QuantumCloud")
                .body(Body::from("<html><body><h1>503 Service Unavailable</h1><p>The server is temporarily unavailable and the error page could not be loaded.</p></body></html>"))
                .unwrap();
            Ok(fallback_response)
        }
    }
}
async fn proxy_request(req: Request<Body>, ip: String, port: u16) -> Result<Response<Body>, hyper::Error>{
    let remote_server = format!("http://{}:{}", ip, port);
    let uri_string = format!("{}{}", remote_server, req.uri().path_and_query().map(|x| x.as_str()).unwrap_or(""));
    let uri = uri_string.parse::<Uri>().unwrap();
    let client = Client::new();
    let headers = req.headers().clone();
    let mut proxy_req = Request::builder()
        .method(req.method())
        .uri(uri)
        .body(req.into_body())
        .unwrap();
    *proxy_req.headers_mut() = headers;
    match client.request(proxy_req).await {
        Ok(response) => Ok(response),
        Err(_) => {
            render_service_unavailable().await
        }
    }
}

async fn handle_ws_message(msg: Message, manager: SharedProxyManager){
    if let Ok(text) = msg.to_text(){
        let value: serde_json::Value = serde_json::from_str(text).unwrap();
        let event_type = value["event"].as_str().unwrap();

        match event_type{
            "createReverseProxy" => {
                let data: CreateProxyData = serde_json::from_value(value["data"].clone()).unwrap();
                create_reverse_proxy(data.external_port, data.ip_address, data.internal_port, manager).await;
            }
            "deleteReverseProxy" => {
                let data: CreateProxyData = serde_json::from_value(value["data"].clone()).unwrap();
                println!("@network-gateway/main.rs: Attempting to delete proxy on port: {}", data.external_port);
                delete_reverse_proxy(data.external_port, manager).await;
            },
            _ => println!("@network-gateway/main.rs: Unknown event: {}", event_type)
        }
    }
}

async fn delete_reverse_proxy(port: u16, manager: SharedProxyManager){
    let mut manager_guard = manager.write().unwrap();
    manager_guard.delete_proxy(port.to_string());
}

async fn start_websocket_server(manager: SharedProxyManager) -> Result<(), Box<dyn std::error::Error>>{
    let listener = TcpListener::bind("0.0.0.0:10000").await?;
    println!("@network-gateway/main.rs: Listening for WS connections at ws://0.0.0.0:10000");

    while let Ok((stream, _)) = listener.accept().await{
        let ws_stream = accept_async(stream).await.unwrap();
        let manager = manager.clone();
        tokio::spawn(async move{
            let (_write, mut read) = ws_stream.split();
            while let Some(message) = read.next().await{
                if let Ok(msg) = message{
                    handle_ws_message(msg, manager.clone()).await;
                }
            }
        });
    }

    Ok(())
}

#[tokio::main]
async fn main(){
    let proxy_manager = Arc::new(RwLock::new(ProxyManager::new()));
    if let Err(e) = start_websocket_server(proxy_manager).await {
        eprintln!("Server error: {}", e);
    }
}
