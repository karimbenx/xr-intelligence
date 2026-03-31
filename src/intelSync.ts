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
                // Use multiple CORS proxies as fallback for better reliability
                const proxiedFetch = async (url: string) => {
                    const proxies = [
                        (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
                        (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
                        (u: string) => `https://proxy.cors.sh/${u}` // Requires key usually, but some public ones work
                    ];
                    
                    for (const proxy of proxies) {
                        try {
                            const proxyUrl = proxy(url);
                            const response = await fetch(proxyUrl, { 
                                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } 
                            });
                            if (response.ok) return await response.text();
                        } catch (e) {
                            console.warn(`Proxy failed:`, e); continue;
                        }
                    }
                    throw new Error("ALL_PROXIES_FAILED");
                };
                
                const xmlText = await proxiedFetch(feed.url);
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, "text/xml");
                
                // Flexible selector for various RSS/Atom formats
                const items = Array.from(xmlDoc.querySelectorAll("item, entry, [localName='item'], [localName='entry']"));
                
                let hostname = 'unknown';
                try { hostname = new URL(feed.url).hostname.replace('www.', ''); } catch (e) {}

                return items.map((item) => {
                    const title = (item.querySelector("title")?.textContent || "Untitled Signal").trim();
                    let link = item.querySelector("link")?.getAttribute("href") || item.querySelector("link")?.textContent || "#";
                    
                    // Specific fix for some RSS formats where link is inside a node
                    if (link === "#") {
                         const linkNode = item.getElementsByTagName("link")[0];
                         link = linkNode?.getAttribute("href") || linkNode?.textContent || "#";
                    }
                    
                    const pubDate = item.querySelector("pubDate, published, updated, dc\\:date")?.textContent || new Date().toISOString();
                    const description = item.querySelector("description, summary, content")?.textContent || "";
                    const contentSnippet = description.replace(/<[^>]*>/g, '').substring(0, 250).trim();

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
