import { Handler } from "@netlify/functions";
import Parser from 'rss-parser';

const parser = new Parser();

export const handler: Handler = async (event) => {
    const feedUrl = event.queryStringParameters?.url;

    if (!feedUrl) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing url parameter" }) };
    }

    try {
        const feed = await parser.parseURL(feedUrl);
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(feed),
        };
    } catch (err: any) {
        console.error("Proxy error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch feed", details: err.message }),
        };
    }
};
