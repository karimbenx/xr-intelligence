import React, { useEffect, useState, useCallback } from 'react';
import { fetchIntelligenceBatch, IntelArticle } from './intelSync';
import { ALL_FEEDS } from './data/feeds';
import { ExecutiveDashboard } from './Dashboard';
import './App.css';

const CATEGORY_MAP: Record<string, string> = {
    'ALL': 'Home',
    'TECHNOLOGY': 'Technology',
    'CUSTOMER': 'Customer Interaction',
    'GEOGRAPHIC': 'Geographic',
    'EVENTS': 'Global Events',
    'COMPANIES': 'Companies',
    'PRODUCTS': 'Products'
};

export const App: React.FC = () => {
    const [articles, setArticles] = useState<IntelArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [dataSource, setDataSource] = useState<'DB' | 'RSS' | null>(null);

    const loadData = useCallback(async (forceSync = false) => {
        if (forceSync) setSyncing(true);
        else setLoading(true);

        try {
            // Try fetching from Neon DB via Netlify Function first
            const endpoint = forceSync
                ? '/.netlify/functions/sync-signals?sync=true'
                : '/.netlify/functions/sync-signals';

            const response = await fetch(endpoint);

            if (response.ok) {
                const data = await response.json();
                // Handle both new object format and legacy array format
                const incomingArticles = Array.isArray(data) ? data : data.articles;

                if (incomingArticles && incomingArticles.length > 0) {
                    setArticles(incomingArticles);
                    if (data.lastUpdated) setLastUpdated(data.lastUpdated);
                    setDataSource('DB');
                } else if (!forceSync) {
                    const directData = await fetchIntelligenceBatch(ALL_FEEDS);
                    setArticles(directData);
                    setDataSource('RSS');
                }
            } else {
                throw new Error(`Server responded with ${response.status}`);
            }
        } catch (e) {
            console.warn("DB Fetch failed, falling back to direct RSS", e);
            // Fallback: Direct RSS fetch in client on failure
            const directData = await fetchIntelligenceBatch(ALL_FEEDS);
            setArticles(directData);
            setDataSource('RSS');
        }

        setLoading(false);
        setSyncing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading && articles.length === 0) {
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

    return (
        <ExecutiveDashboard 
            articles={articles} 
            isSyncing={syncing} 
            onSync={() => loadData(true)}
            lastUpdated={lastUpdated}
            dataSource={dataSource}
        />
    );
};