import { neon } from '@neondatabase/serverless';
import { Handler } from "@netlify/functions";
import Parser from 'rss-parser';
import { ALL_FEEDS } from "../../src/data/feeds";

const parser = new Parser();

export const handler: Handler = async (event, _context) => {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
        return { statusCode: 500, body: JSON.stringify({ error: "DATABASE_URL is not defined in Environment Variables." }) };
    }

    const sql = neon(DATABASE_URL);

    // Ensure table exists
    await sql`
        CREATE TABLE IF NOT EXISTS signals (
            id SERIAL PRIMARY KEY,
            title TEXT,
            link TEXT UNIQUE,
            pub_date TIMESTAMP,
            content_snippet TEXT,
            source TEXT,
            category TEXT,
            tags TEXT[],
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const shouldSync = event.queryStringParameters?.sync === "true" || true; // Always sync for now if possible or if no data

    if (shouldSync) {
        await Promise.allSettled(
            ALL_FEEDS.map(async (feed) => {
                try {
                    const data = await parser.parseURL(feed.url);
                    const articles = data.items.map(item => ({
                        title: item.title || "Untitled Signal",
                        link: item.link || "#",
                        pub_date: item.pubDate ? new Date(item.pubDate) : new Date(),
                        content_snippet: (item.contentSnippet || item.content || "").substring(0, 500).replace(/<[^>]*>/g, ''),
                        source: new URL(feed.url).hostname.replace('www.', ''),
                        category: feed.page,
                        tags: detectTags((item.title || "") + " " + (item.contentSnippet || ""))
                    }));

                    for (const article of articles) {
                        await sql`
                            INSERT INTO signals (title, link, pub_date, content_snippet, source, category, tags)
                            VALUES (${article.title}, ${article.link}, ${article.pub_date}, ${article.content_snippet}, ${article.source}, ${article.category}, ${article.tags})
                            ON CONFLICT (link) DO NOTHING;
                        `;
                    }
                    return articles.length;
                } catch (err) {
                    console.error(`Fetch error for ${feed.url}:`, err);
                    return 0;
                }
            })
        );
    }

    // Return the latest signals
    const signals = await sql`
        SELECT title, link, pub_date as "pubDate", content_snippet as "contentSnippet", source, category, tags 
        FROM signals 
        ORDER BY pub_date DESC 
        LIMIT 100;
    `;

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signals)
    };
};

function detectTags(text: string): string[] {
    const keywords = ["AR", "VR", "XR", "AI", "Apple", "Meta", "Web3", "Nvidia", "Tech", "Startup", "India", "Tamil Nadu"];
    const found = keywords.filter(kw => text.toLowerCase().includes(kw.toLowerCase()));
    return found.length > 0 ? found : ["Signal"];
}
