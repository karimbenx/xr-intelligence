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

    // Ensure table exists with core columns
    await sql`
        CREATE TABLE IF NOT EXISTS articles (
            id SERIAL PRIMARY KEY,
            title TEXT,
            topic TEXT,
            source TEXT,
            snippet TEXT
        );
    `;

    // Ensure missing columns are added if table existed with partial schema
    await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS link TEXT UNIQUE;`;
    await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS pub_date TIMESTAMP;`;
    await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags TEXT[];`;
    await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`;

    // Check if we have data or if a sync is forced
    const countResult = await sql`SELECT COUNT(*) FROM articles`;
    const rowCount = parseInt(countResult[0].count);

    const shouldSync = event.queryStringParameters?.sync === "true" || rowCount === 0;

    if (shouldSync) {
        await Promise.allSettled(
            ALL_FEEDS.map(async (feed) => {
                try {
                    const data = await parser.parseURL(feed.url);
                    const items = data.items.map(item => ({
                        title: item.title || "Untitled Signal",
                        link: item.link || "#",
                        pub_date: item.pubDate ? new Date(item.pubDate) : new Date(),
                        snippet: (item.contentSnippet || item.content || "").substring(0, 500).replace(/<[^>]*>/g, ''),
                        source: new URL(feed.url).hostname.replace('www.', ''),
                        topic: feed.page, // Mapping 'page' to 'topic' to match table
                        tags: detectTags((item.title || "") + " " + (item.contentSnippet || ""))
                    }));

                    for (const item of items) {
                        await sql`
                            INSERT INTO articles (title, link, pub_date, snippet, source, topic, tags)
                            VALUES (${item.title}, ${item.link}, ${item.pub_date}, ${item.snippet}, ${item.source}, ${item.topic}, ${item.tags})
                            ON CONFLICT (link) DO NOTHING;
                        `;
                    }
                    return items.length;
                } catch (err) {
                    console.error(`Fetch error for ${feed.url}:`, err);
                    return 0;
                }
            })
        );
    }

    // Return the latest articles, mapped back to the names the frontend expects
    const signals = await sql`
        SELECT 
            title, 
            link, 
            pub_date as "pubDate", 
            snippet as "contentSnippet", 
            source, 
            topic as "category", 
            tags 
        FROM articles 
        ORDER BY pub_date DESC 
        LIMIT 100;
    `;

    // Get the last sync timestamp
    const lastUpdatedResult = await sql`SELECT MAX(created_at) as "lastUpdated" FROM articles`;
    const lastUpdated = lastUpdatedResult[0]?.lastUpdated || null;

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            articles: signals,
            lastUpdated: lastUpdated,
            source: 'database'
        })
    };
};

function detectTags(text: string): string[] {
    const keywords = ["AR", "VR", "XR", "AI", "Apple", "Meta", "Web3", "Nvidia", "Tech", "Startup", "India", "Tamil Nadu"];
    const found = keywords.filter(kw => text.toLowerCase().includes(kw.toLowerCase()));
    return found.length > 0 ? found : ["Signal"];
}
