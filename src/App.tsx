import React, { useEffect, useState, useCallback } from 'react';
import { fetchIntelligenceBatch, IntelArticle } from './intelSync';
import { ALL_FEEDS } from './data/feeds';
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
    const [filter, setFilter] = useState('ALL');

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
                if (data && data.length > 0) {
                    setArticles(data);
                } else if (!forceSync) {
                    // If DB is empty and it wasn't a forced sync, fallback to direct
                    const directData = await fetchIntelligenceBatch(ALL_FEEDS);
                    setArticles(directData);
                }
            } else {
                throw new Error(`Server responded with ${response.status}`);
            }
        } catch (e) {
            console.warn("DB Fetch failed, falling back to direct RSS", e);
            // Fallback: Direct RSS fetch in client on failure
            const directData = await fetchIntelligenceBatch(ALL_FEEDS);
            setArticles(directData);
        }

        setLoading(false);
        setSyncing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const categories = ['ALL', 'TECHNOLOGY', 'CUSTOMER', 'GEOGRAPHIC', 'EVENTS', 'COMPANIES', 'PRODUCTS'];
    const filtered = filter === 'ALL' ? articles : articles.filter(a => a.category === filter);

    return (
        <div className="dashboard-container">
            <header className="main-header">
                <nav className="nav-container">
                    <div className="filter-nav">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={filter === cat ? 'active' : ''}
                                onClick={() => setFilter(cat)}
                            >
                                {CATEGORY_MAP[cat] || cat}
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="status-indicator">
                    <span className={syncing ? 'pulse syncing' : 'pulse'}></span>
                    <span>{syncing ? 'Synchronizing global data streams...' : 'Live Intelligence Stream'}</span>
                    <button
                        className="sync-trigger"
                        onClick={() => loadData(true)}
                        disabled={loading || syncing}
                        title="Force sync with source feeds"
                    >
                        ↻
                    </button>
                </div>
                <h1 className="hero-title">Dashboard</h1>
            </header>

            {loading ? (
                <div className="loading-container">
                    <div className="loader"></div>
                    <p style={{ color: '#94a3b8', fontSize: '14px', letterSpacing: '1px' }}>Synchronizing global data streams...</p>
                </div>
            ) : (
                <div className="intel-grid">
                    {filtered.map((article, idx) => (
                        <a href={article.link} target="_blank" rel="noopener noreferrer" key={idx} className="intel-card">
                            <div className="card-header">
                                <span className="source-pill">{article.source}</span>
                                <span className="date-text">{new Date(article.pubDate).toLocaleDateString()}</span>
                            </div>
                            <h3 className="article-title">{article.title}</h3>
                            <p className="article-snippet">{article.contentSnippet}</p>
                            <div className="tag-container">
                                {article.tags.map(tag => (
                                    <span key={tag} className="tag-label">#{tag}</span>
                                ))}
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};