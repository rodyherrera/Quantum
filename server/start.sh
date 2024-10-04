#!/bin/bash

# Path for the network-gateway binary
BIN_PATH="../network-gateway/target/release/quantum_network_gateway"
PORT=10000
GATEWAY_PID=""

# Handle CTRL+C (SIGINT) to ensure the network-gateway process is killed
cleanup(){
    echo "@server/start.sh: Caught SIGNIN signal! Stopping Quantum-Network-Gateway-Service"
    if [ ! -z "$GATEWAY_PID" ]; then
        kill -9 $GATEWAY_PID
        echo "@server/start.sh: Quantum-Network-Gateway-Service stopped."
    fi
    exit 0
}

trap cleanup SIGINT

# Check if Rust is installed
if ! command -v rustc &> /dev/null
then
    echo "@server/start.sh: Rust is not installed. Installing Rust..."
    curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
    echo "@server/start.sh: Rust installed successfully."
else
    echo "@server/start.sh: Rust is already installed."
fi

# Kill any process using the port 10000
if lsof -i :$PORT -t > /dev/null; then
    echo "@server/start.sh: Port $PORT is in use. Killing process..."
    lsof -i :$PORT -t | xargs kill -9
    echo "@server/start.sh: Process using port $PORT has been killed."
else
    echo "@server/start.sh: Port $PORT is free."
fi

# Check if the network-gateway binary exists
if [ ! -f "$BIN_PATH" ]; then
    echo "@server/start.sh: network-gateway binary not found. Building the binary..."
    cd ../network-gateway
    cargo build --release
    cd -  
else
    echo "@server/start.sh: network-gateway binary found."
fi

# Start the network-gateway binary
echo "@server/start.sh: Starting Quantum-Network-Gateway-Service"
$BIN_PATH &

# Store the PID of the network-gateway process
GATEWAY_PID=$! 

# Run the Node.js server without backgrounding it
echo "@server/start.sh: Starting Node.js server with npx tsx..."
npx tsx server.ts

# When the Node.js process exits, kill the network-gateway process
echo "@server/start.sh: Node.js server has stopped. Killing Quantum-Network-Gateway-Service..."
cleanup