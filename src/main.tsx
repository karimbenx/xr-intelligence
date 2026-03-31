import React from 'react'
import ReactDOM from 'react-dom/client'
import { ExecutiveDashboard } from './Dashboard'
import { fetchIntelligenceBatch, IntelArticle } from './intelSync'
import { ALL_FEEDS } from './data/feeds'
import './index.css'

console.log("Matrix Initializing...");

const MOCK_ARTICLE: IntelArticle = {
    title: "Intelligence Matrix Successfully Established",
    link: "#",
    pubDate: new Date().toISOString(),
    contentSnippet: "The XR Intelligence Matrix has been initialized. If you see this, the application core is stable. Live signals are being synchronized in the background.",
    source: "SYSTEM_CORE",
    category: "TECHNOLOGY",
    tags: ["CORE", "STABLE"]
};

const App = () => {
    const [articles, setArticles] = React.useState<IntelArticle[]>([MOCK_ARTICLE]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        console.log("Fetching live signals...");
        const loadFeeds = async () => {
            try {
                const data = await fetchIntelligenceBatch(ALL_FEEDS.slice(0, 100));
                console.log(`Successfully ingested ${data.length} signals from the last 7 days.`);

                if (data.length > 0) {
                    setArticles(data);
                }
            } catch (err: any) {
                console.error("Signal Ingestion Error:", err);
                setError(err.message || "Failed to establish intelligence link.");
            } finally {
                setLoading(false);
            }
        };
        loadFeeds();
    }, []);

    if (error) {
        return (
            <div className="min-h-screen bg-red-950 text-red-200 flex flex-col items-center justify-center p-12 text-center">
                <h1 className="text-4xl font-black mb-4 tracking-tighter">CRITICAL_EXCEPTION_CORE</h1>
                <p className="text-xl opacity-80 mb-8 font-mono">{error}</p>
                <button onClick={() => window.location.reload()} className="px-6 py-3 bg-red-800 rounded-lg font-bold hover:bg-red-700 transition-all">REBOOT_MATRIX</button>
            </div>
        );
    }

    if (loading && articles.length <= 1) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-blue-500 font-sans p-8">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full animate-pulse" />
                    </div>
                </div>
                <h2 className="text-xl font-black tracking-widest uppercase mb-2">Synchronizing Matrix</h2>
                <p className="text-slate-500 text-sm font-mono animate-pulse">Establishing secure intelligence link...</p>
            </div>
        );
    }

    return <ExecutiveDashboard articles={articles} />;
};

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


