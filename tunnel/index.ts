import { serve } from "bun";
import { spawn } from "bun";

let chromeProcess: any = null;

// Función para lanzar Chrome con DevTools
async function launchChrome() {
  console.log("🚀 Launching Chrome with DevTools...");
  
  const chromeArgs = [
    "--remote-debugging-address=0.0.0.0",
    "--remote-debugging-port=9222",
    "--user-data-dir=/tmp/remote-profile"
  ];

  try {
    chromeProcess = spawn({
      cmd: ["C:/Program Files/Google/Chrome/Application/chrome.exe", ...chromeArgs],
      stdout: "pipe",
      stderr: "pipe",
    });

    console.log("✅ Chrome launched with PID:", chromeProcess.pid);
    
    // Esperar un momento para que Chrome se inicie
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar que DevTools esté disponible
    try {
      const res = await fetch("http://127.0.0.1:9222/json/version");
      if (res.ok) {
        console.log("✅ Chrome DevTools is ready");
        return true;
      }
    } catch (e) {
      console.log("⏳ Waiting for Chrome DevTools...");
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    return true;
  } catch (error) {
    console.error("❌ Failed to launch Chrome:", error);
    return false;
  }
}

// Función para cerrar Chrome
function killChrome() {
  if (chromeProcess) {
    console.log("🔴 Terminating Chrome process...");
    try {
      chromeProcess.kill();
      console.log("✅ Chrome process terminated");
    } catch (error) {
      console.error("❌ Error terminating Chrome:", error);
    }
  }
}

// Manejar señales de terminación
function setupSignalHandlers() {
  const signals = ['SIGINT', 'SIGTERM', 'SIGUSR1', 'SIGUSR2'];
  
  signals.forEach(signal => {
    process.on(signal, () => {
      console.log(`\n📢 Received ${signal}, shutting down...`);
      killChrome();
      process.exit(0);
    });
  });
}

// Configurar manejadores de señales
setupSignalHandlers();

// Lanzar Chrome antes de iniciar el proxy
const chromeStarted = await launchChrome();
if (!chromeStarted) {
  console.error("❌ Could not start Chrome. Exiting...");
  process.exit(1);
}

serve({
  port: 9223,
  fetch: async (req, server) => {
    const { method, headers } = req;
    const upgradeHeader = headers.get("upgrade");
    const url = new URL(req.url);
    
    console.log(`[FETCH] ${method} ${url.pathname}${url.search} | Upgrade: ${upgradeHeader}`);

    if (server.upgrade(req)) {
      console.log(`[UPGRADE WS] ${url.pathname}${url.search}`);
      return;
    }

    const targetUrl = `http://127.0.0.1:9222${url.pathname}${url.search}`;
    console.log(`[PROXY HTTP] ${method} ${url.pathname}${url.search} -> ${targetUrl}`);

    try {
      const upstream = await fetch(targetUrl, {
        method,
        headers,
        body: req.body,
      });

      const contentType = upstream.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const text = await upstream.text();
        const modifiedText = text.replace(
          /ws:\/\/localhost:9222/g, 
          "ws://localhost:9223"
        ).replace(
          /ws:\/\/127\.0\.0\.1:9222/g,
          "ws://localhost:9223"
        );
        
        return new Response(modifiedText, {
          status: upstream.status,
          headers: upstream.headers,
        });
      }

      return new Response(await upstream.arrayBuffer(), {
        status: upstream.status,
        headers: upstream.headers,
      });
    } catch (error) {
      console.error("[PROXY ERROR]", error);
      return new Response("Proxy Error", { status: 502 });
    }
  },
  websocket: {
    open: async (client) => {
      console.log("[WS OPEN] Client connected, getting dynamic URL...");
      
      try {
        const res = await fetch("http://127.0.0.1:9222/json/version");
        if (!res.ok) {
          throw new Error(`DevTools responded with ${res.status}`);
        }
        
        const { webSocketDebuggerUrl: wsUrl } = await res.json();
        console.log(`[WS CONNECT] Connecting to: ${wsUrl}`);
        
        const chrome = new WebSocket(wsUrl);
        chrome.binaryType = "arraybuffer";
        
        (client as any).chrome = chrome;
        (client as any).chromeReady = false;

        chrome.addEventListener("open", () => {
          console.log("[WS CHROME] ✅ Successfully connected to DevTools");
          (client as any).chromeReady = true;
          
          const pendingMessages = (client as any).pendingMessages || [];
          pendingMessages.forEach((msg: any) => {
            if (chrome.readyState === WebSocket.OPEN) {
              chrome.send(msg);
            }
          });
          (client as any).pendingMessages = [];
        });

        chrome.addEventListener("message", (e) => {
          try {
            client.send(e.data);
          } catch (err) {
            console.error("[WS] Error sending message to client:", err);
          }
        });

        chrome.addEventListener("close", (e) => {
          console.log(`[WS CHROME] Disconnected: ${e.code} ${e.reason}`);
          try {
            client.close(e.code, e.reason);
          } catch (err) {
            console.error("[WS] Error closing client:", err);
          }
        });

        chrome.addEventListener("error", (e) => {
          console.error("[WS CHROME] Connection error:", e);
          try {
            client.close(1011, "Error in DevTools connection");
          } catch (err) {
            console.error("[WS] Error closing client due to error:", err);
          }
        });

      } catch (err) {
        console.error("[WS ERROR] Error connecting to DevTools:", err);
        try {
          client.close(1011, "Could not connect to Chrome DevTools");
        } catch (closeErr) {
          console.error("[WS] Error closing client:", closeErr);
        }
      }
    },
    message: (client, message) => {
      const chrome = (client as any).chrome;
      const chromeReady = (client as any).chromeReady;
      
      if (chrome && chromeReady && chrome.readyState === WebSocket.OPEN) {
        try {
          chrome.send(message);
        } catch (err) {
          console.error("[WS] Error sending message to Chrome:", err);
        }
      } else {
        console.log("[WS] Chrome not ready, queuing message");
        if (!(client as any).pendingMessages) {
          (client as any).pendingMessages = [];
        }
        (client as any).pendingMessages.push(message);
      }
    },
    close: (client) => {
      console.log("[WS CLOSE] Closing client connection");
      const chrome = (client as any).chrome;
      if (chrome && chrome.readyState !== WebSocket.CLOSED) {
        try {
          chrome.close();
        } catch (err) {
          console.error("[WS] Error closing Chrome WebSocket:", err);
        }
      }
    }
  }
});

console.log("🚀 Proxy server running on port 9223");
console.log("📋 Chrome DevTools URLs will be automatically rewritten");
console.log("🔗 Access DevTools at: http://localhost:9223");
console.log("⚡ WebSocket connections will use dynamic Chrome DevTools URLs");
console.log("💡 Press Ctrl+C to stop both proxy and Chrome");