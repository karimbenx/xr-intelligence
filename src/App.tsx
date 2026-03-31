import React, { useEffect, useState } from 'react';
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
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const data = await fetchIntelligenceBatch(ALL_FEEDS);
            setArticles(data);
            setLoading(false);
        };
        loadData();
    }, []);

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
                    <span className="pulse"></span>
                    <span>Live Intelligence Stream</span>
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