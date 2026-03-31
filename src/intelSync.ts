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
                // Use a more robust CORS proxy with cache busting to avoid origin-mismatch errors
                const cacheBuster = `&_t=${Date.now()}`;
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(feed.url + (feed.url.includes('?') ? cacheBuster : '?' + cacheBuster))}`;
                
                const response = await fetch(proxyUrl);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const xmlText = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, "text/xml");
                
                // Handle parser errors
                const parseError = xmlDoc.getElementsByTagName("parsererror")[0];
                if (parseError) throw new Error("XML_PARSE_ERROR");

                const items = Array.from(xmlDoc.querySelectorAll("item, entry"));
                let hostname = 'unknown';
                try {
                    hostname = new URL(feed.url).hostname.replace('www.', '');
                } catch (e) { /* invalid URL */ }

                return items.map((item) => {
                    const title = item.querySelector("title")?.textContent || "Untitled Signal";
                    const link = item.querySelector("link")?.getAttribute("href") || item.querySelector("link")?.textContent || "#";
                    const pubDate = item.querySelector("pubDate, published, updated")?.textContent || new Date().toISOString();
                    const description = item.querySelector("description, summary, content")?.textContent || "";
                    const contentSnippet = description.replace(/<[^>]*>/g, '').substring(0, 250);

                    return {
                        title,
                        link,
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

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return results
        .filter((res): res is PromiseFulfilledResult<IntelArticle[]> => res.status === 'fulfilled')
        .flatMap(res => res.value)
        .filter(article => new Date(article.pubDate).getTime() > oneWeekAgo.getTime())
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}


function detectTags(text: string): string[] {
    const keywords = ["AR", "VR", "XR", "AI", "Apple", "Meta", "Web3", "Nvidia", "Tech", "Startup", "India", "Tamil Nadu"];
    const found = keywords.filter(kw => text.toLowerCase().includes(kw.toLowerCase()));
    return found.length > 0 ? found : ["Signal"];
}
