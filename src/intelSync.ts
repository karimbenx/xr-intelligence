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
                // Use robust CORS proxy rotation to bypass access restrictions
                const proxiedFetch = async (url: string) => {
                    const proxies = [
                        (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
                        (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
                        (u: string) => `https://thingproxy.freeboard.io/fetch/${u}`,
                        (u: string) => `https://yacdn.org/proxy/${u}`
                    ];
                    
                    let lastError: Error | null = null;
                    for (const proxy of proxies) {
                        try {
                            const proxyUrl = proxy(url);
                            const response = await fetch(proxyUrl, { 
                                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } 
                            });
                            
                            if (response.ok) return await response.text();
                            
                            // If we get an error but the connection worked, log and continue to next proxy
                            console.warn(`Proxy [${proxyUrl.split('/')[2]}] returned ${response.status} for ${url}`);
                            lastError = new Error(`HTTP ${response.status}`);
                        } catch (e: any) {
                            console.warn(`Proxy failed connection:`, e);
                            lastError = e;
                        }
                    }
                    throw lastError || new Error("ALL_PROXIES_FAILED");
                };
                
                const xmlText = await proxiedFetch(feed.url);
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, "text/xml");
                
                // Detailed selector for various RSS/Atom formats
                const items = Array.from(xmlDoc.querySelectorAll("item, entry, [localName='item'], [localName='entry']"));
                
                let hostname = 'unknown';
                try { hostname = new URL(feed.url).hostname.replace('www.', ''); } catch (e) {}

                return items.map((item) => {
                    const titleNode = item.querySelector("title");
                    const title = (titleNode?.textContent || "Untitled Signal").trim();
                    
                    let link = item.querySelector("link")?.getAttribute("href") || 
                               item.querySelector("link")?.textContent || "#";
                    
                    if (link === "#" || link === "") {
                         const linkNode = item.getElementsByTagName("link")[0];
                         link = linkNode?.getAttribute("href") || linkNode?.textContent || "#";
                    }
                    
                    const pubDate = item.querySelector("pubDate, published, updated, dc\\:date")?.textContent || new Date().toISOString();
                    const description = item.querySelector("description, summary, content")?.textContent || "";
                    const contentSnippet = description.replace(/<[^>]*>/g, '').substring(0, 300).trim();

                    return {
                        title,
                        link: link.trim(),
                        pubDate,
                        contentSnippet: contentSnippet || "No summary available.",
                        source: hostname,
                        category: feed.page,
                        tags: detectTags(title + " " + contentSnippet)
                    };
                });
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
