export interface IntelArticle {
    title: string;
    link: string;
    pubDate: string;
    contentSnippet: string;
    source: string;
    category: string;
    tags: string[];
}

export interface FeedSource {
    url: string;
    page: string;
    topic?: string;
    subtopic?: string;
}

export async function fetchIntelligenceBatch(feeds: FeedSource[]): Promise<IntelArticle[]> {
    const results = await Promise.allSettled(
        feeds.map(async (feed) => {
            try {
                // Unified fetch with server-side proxy fallback
                const fetchArticles = async (url: string) => {
                    // Strategy 1: Use our dedicated Netlify RSS Proxy (Server-side, no CORS issues)
                    try {
                        const netlifyProxyUrl = `/.netlify/functions/rss-proxy?url=${encodeURIComponent(url)}`;
                        const response = await fetch(netlifyProxyUrl);
                        if (response.ok) {
                            const data = await response.json();
                            return (data.items || []).map((item: any) => ({
                                title: (item.title || "Untitled Signal").trim(),
                                link: (item.link || "#").trim(),
                                pubDate: item.pubDate || new Date().toISOString(),
                                contentSnippet: (item.contentSnippet || item.content || "").replace(/<[^>]*>/g, '').substring(0, 300).trim(),
                                source: new URL(feed.url).hostname.replace('www.', ''),
                                category: feed.page,
                                tags: detectTags((item.title || "") + " " + (item.contentSnippet || ""))
                            }));
                        }
                    } catch (e) {
                        console.warn("Netlify RSS Proxy failed, falling back to public proxies", e);
                    }

                    // Strategy 2: Fallback to public CORS rotation (Legacy XML Parsing)
                    const proxies = [
                        (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
                        (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
                        (u: string) => `https://thingproxy.freeboard.io/fetch/${u}`
                    ];
                    
                    for (const proxy of proxies) {
                        try {
                            const xmlText = await fetch(proxy(url)).then(r => r.ok ? r.text() : Promise.reject());
                            const xmlDoc = new DOMParser().parseFromString(xmlText, "text/xml");
                            const items = Array.from(xmlDoc.querySelectorAll("item, entry, [localName='item'], [localName='entry']"));
                            
                            return items.map((item) => {
                                const title = (item.querySelector("title")?.textContent || "Untitled Signal").trim();
                                let link = item.querySelector("link")?.getAttribute("href") || item.querySelector("link")?.textContent || "#";
                                if (link === "#") link = item.getElementsByTagName("link")[0]?.textContent || "#";
                                
                                const description = item.querySelector("description, summary, content")?.textContent || "";
                                return {
                                    title,
                                    link: link.trim(),
                                    pubDate: item.querySelector("pubDate, published, updated")?.textContent || new Date().toISOString(),
                                    contentSnippet: description.replace(/<[^>]*>/g, '').substring(0, 300).trim(),
                                    source: new URL(feed.url).hostname.replace('www.', ''),
                                    category: feed.page,
                                    tags: detectTags(title + " " + description)
                                };
                            });
                        } catch (e) { continue; }
                    }
                    return [];
                };
                
                return await fetchArticles(feed.url);
            } catch (err) {
                console.error(`Feed Access Failure: ${feed.url}`, err);
                return [];
            }
        })
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return results
        .filter((res): res is PromiseFulfilledResult<IntelArticle[]> => res.status === 'fulfilled')
        .flatMap(res => res.value)
        .filter(article => {
            const d = new Date(article.pubDate);
            return !isNaN(d.getTime()) && d.getTime() > thirtyDaysAgo.getTime();
        })
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}


function detectTags(text: string): string[] {
    const keywords = ["AR", "VR", "XR", "AI", "Apple", "Meta", "Web3", "Nvidia", "Tech", "Startup", "India", "Tamil Nadu"];
    const found = keywords.filter(kw => text.toLowerCase().includes(kw.toLowerCase()));
    return found.length > 0 ? found : ["Signal"];
}
