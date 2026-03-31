import React, { useState, useMemo } from 'react';
import { IntelArticle } from './intelSync';
import { 
  Activity, 
  Cpu, 
  Globe, 
  TrendingUp, 
  Zap, 
  Layers, 
  Search, 
  ChevronRight,
  Filter,
  BarChart3,
  RefreshCw,
  Bell
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind class merging (often used in these projects)
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const CATEGORY_MAP: Record<string, { label: string; icon: React.ReactNode }> = {
    'ALL': { label: "🏠 Executive Dashboard", icon: <Layers size={16} /> },
    'TECHNOLOGY': { label: "Technology", icon: <Cpu size={16} /> },
    'CUSTOMER': { label: "🤝 Customer Interaction", icon: <Globe size={16} /> },
    'GEOGRAPHIC': { label: "Geographic", icon: <Globe size={16} /> },
    'EVENTS': { label: "📅 Global Events (XR, Web 3.0, Industry 4.0)", icon: <ChevronRight size={16} /> },
    'COMPANIES': { label: "Companies", icon: <BarChart3 size={16} /> },
    'PRODUCTS': { label: "Products", icon: <BarChart3 size={16} /> },
    'SOURCES': { label: "⚙️ Sources Management", icon: <Filter size={16} /> },
    'ARCHIVE': { label: "📦 Intelligence Archive", icon: <Layers size={16} /> },
};

export const ExecutiveDashboard = ({ 
    articles, 
    isSyncing, 
    onSync, 
    lastUpdated, 
    dataSource 
}: { 
    articles: IntelArticle[], 
    isSyncing: boolean, 
    onSync: () => void, 
    lastUpdated: string | null, 
    dataSource: 'DB' | 'RSS' | null 
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['ALL', 'TECHNOLOGY', 'CUSTOMER', 'GEOGRAPHIC', 'EVENTS', 'COMPANIES', 'PRODUCTS', 'SOURCES', 'ARCHIVE'];

    const filteredArticles = useMemo(() => {
        return articles.filter(article => {
            const matchesCategory = selectedCategory === 'ALL' || article.category === selectedCategory;
            const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 article.source.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [articles, selectedCategory, searchQuery]);

    const stats = useMemo(() => ({
        total: articles.length,
        tech: articles.filter(a => a.category === 'TECHNOLOGY').length,
        geo: articles.filter(a => a.category === 'GEOGRAPHIC').length,
        trending: articles.filter(a => a.tags.length > 2).length
    }), [articles]);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Glassmorphic Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 flex h-screen overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-72 border-r border-slate-800/50 bg-slate-900/40 backdrop-blur-xl flex flex-col p-6 space-y-8 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Zap className="text-white fill-white" size={20} />
                        </div>
                        <div>
                            <h1 className="text-sm font-black tracking-widest text-white uppercase leading-none">XR PLATINUM</h1>
                            <p className="text-[10px] text-slate-500 font-bold tracking-tight mt-0.5 italic">v8.5 ENTERPRISE</p>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-1">
                        <p className="px-2 text-[10px] font-black uppercase text-slate-600 tracking-[0.2em] mb-4">Intelligence Matrix</p>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group text-left",
                                    selectedCategory === cat 
                                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_-5px_rgba(59,130,246,0.3)]" 
                                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                                )}
                            >
                                <span className="flex items-center gap-3">
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        {CATEGORY_MAP[cat]?.icon}
                                    </span>
                                    {CATEGORY_MAP[cat]?.label || cat}
                                </span>
                                {(cat !== 'SOURCES' && cat !== 'ARCHIVE') && (
                                    <span className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                        selectedCategory === cat ? "bg-blue-500/20" : "bg-slate-800/80"
                                    )}>
                                        {cat === 'ALL' ? articles.length : articles.filter(a => a.category === cat).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>


                    <div className="pt-6 border-t border-slate-800/50">
                        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Status</span>
                                <div className={cn("w-2 h-2 rounded-full", isSyncing ? "bg-blue-500 animate-pulse" : "bg-emerald-500")} />
                            </div>
                            <p className="text-xs text-slate-300 font-medium mb-1">{isSyncing ? "Syncing..." : "Live Intelligence Active"}</p>
                            <div className="h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                                <div className={cn("h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000", isSyncing ? "w-[100%] animate-pulse" : "w-[100%]")} />
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Header Strip */}
                    <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-6 flex-1">
                            <div className="relative max-w-md w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Execute signal search..."
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <StatItem label="Active Nodes" value={stats.total} icon={<Activity size={14} />} />
                                <StatItem label="Signal Momentum" value={`${stats.trending} High`} icon={<TrendingUp size={14} />} />
                                {dataSource && <StatItem label="Source Engine" value={dataSource} icon={<Zap size={14} />} />}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                                <Bell size={20} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-950" />
                            </button>
                            <button 
                                onClick={onSync}
                                disabled={isSyncing}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-blue-600/20 active:scale-95",
                                    isSyncing && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                                {isSyncing ? "SYNCING..." : "SYNC MATRIX"}
                            </button>
                        </div>
                    </header>

                    {/* Dashboard Content */}
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                                    {selectedCategory === 'ALL' ? 'Global Intelligence Feed' : `${selectedCategory} Intelligence`}
                                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono font-bold tracking-widest">
                                        SECURE_MODE
                                    </span>
                                </h2>
                                <p className="text-slate-500 text-sm mt-1">Analyzing cross-matrix signals from the last 7 days for real-time strategic alignment.</p>

                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                                <span>LAST_SYNC: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'PENDING'}</span>
                            </div>
                        </div>

                        {/* Article Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {filteredArticles.length > 0 ? (
                                filteredArticles.slice(0, 48).map((article, idx) => (
                                    <ArticleCard key={idx} article={article} />
                                ))
                            ) : (
                                <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl">
                                    <Search size={48} className="mb-4 opacity-20" />
                                    <p className="text-lg font-medium">No signals detected in this cluster.</p>
                                    <p className="text-sm mt-1 italic">Try adjusting your search parameters or filter settings.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

const ArticleCard = ({ article }: { article: IntelArticle }) => (
    <div className="group relative bg-slate-900/30 border border-slate-800/50 hover:border-blue-500/30 p-5 rounded-2xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1">
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="text-blue-500" size={20} />
        </div>
        
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-slate-800/80 text-blue-400 border border-slate-700/50 text-[10px] font-black uppercase tracking-widest rounded-md">
                    {article.category}
                </span>
                <span className="text-[10px] font-bold text-slate-500 italic truncate max-w-[120px]">
                    {article.source}
                </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-600">
                {new Date(article.pubDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
        </div>

        <h3 className="text-white group-hover:text-blue-400 font-bold text-lg mb-3 leading-tight transition-colors line-clamp-2">
            <a href={article.link} target="_blank" rel="noreferrer" className="after:absolute after:inset-0">
                {article.title}
            </a>
        </h3>
        
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-6">
            {article.contentSnippet || "No summary available for this signal."}
        </p>

        <div className="flex items-center gap-2 flex-wrap h-6 mt-auto">
            {article.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/40 text-[9px] font-bold text-slate-400 border border-slate-800/60 rounded uppercase tracking-wider">
                    <div className="w-1 h-1 bg-blue-500/50 rounded-full" />
                    {tag}
                </span>
            ))}
            {article.tags.length > 3 && (
                <span className="text-[9px] font-bold text-slate-600">+{article.tags.length - 3}</span>
            )}
        </div>
    </div>
);

const StatItem = ({ label, value, icon }: { label: string, value: any, icon: React.ReactNode }) => (
    <div className="flex items-center gap-2">
        <div className="text-blue-500/50">{icon}</div>
        <div className="flex flex-col">
            <span className="text-[9px] uppercase font-black text-slate-600 leading-none">{label}</span>
            <span className="text-xs font-bold text-white leading-none mt-1">{value}</span>
        </div>
    </div>
);

