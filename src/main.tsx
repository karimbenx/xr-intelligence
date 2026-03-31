import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

console.log("Matrix Initializing...");

try {
    const root = document.getElementById('root');
    if (!root) throw new Error("CRITICAL_ERROR: DOM TARGET 'ROOT' NOT FOUND");
    
    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    )
} catch (e: any) {
    console.error("BOOT_FAILURE:", e);
    document.body.innerHTML = `<div style="background:#450a0a; color:#fecaca; padding:2rem; font-family:monospace;"><h1>BOOT_FAILURE: ${e.message}</h1></div>`;
}


