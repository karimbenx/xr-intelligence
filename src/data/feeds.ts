/**
 * Comprehensive Feed Collection for XR Intelligence
 * Extracted from v8.5 Platinum Pro Core
 */

export interface FeedSource {
  url: string;
  page: string;
  topic?: string;
  subtopic?: string;
  region?: string;
  size?: 'Small' | 'Medium' | 'Large';
  company?: string;
  focus?: string;
}

export const ALL_FEEDS: FeedSource[] = [
  // --- AR / VR / XR / MR Core ---
  { url: "https://www.roadtovr.com/feed", page: "TECHNOLOGY", topic: "AR VR XR MR", subtopic: "XR News", region: "Global", size: "Large" },
  { url: "https://uploadvr.com/feed", page: "TECHNOLOGY", topic: "AR VR XR MR", subtopic: "Reviews", region: "Global", size: "Large" },
  { url: "https://www.auganix.org/feed", page: "TECHNOLOGY", topic: "AR VR XR MR", subtopic: "Industry News", region: "Global", size: "Medium" },
  { url: "https://arpost.co/category/news/feed", page: "TECHNOLOGY", topic: "AR VR XR MR", subtopic: "AR News", region: "Global", size: "Medium" },
  { url: "https://xrtoday.com/feed", page: "TECHNOLOGY", topic: "AR VR XR MR", subtopic: "Enterprise XR", region: "Global", size: "Large" },
  { url: "https://hypergridbusiness.com/feed", page: "TECHNOLOGY", topic: "AR VR XR MR", subtopic: "VR Metaverse", region: "Global", size: "Medium" },
  { url: "https://skarredghost.com/feed", page: "TECHNOLOGY", topic: "AR VR XR MR", subtopic: "Developer Blog", region: "Global", size: "Small" },

  // --- Industry 4.0 ---
  { url: "https://www.automationworld.com/rss.xml", page: "TECHNOLOGY", topic: "Industry 4.0", subtopic: "Automation", region: "US", size: "Large" },
  { url: "https://www.industryweek.com/rss/all", page: "TECHNOLOGY", topic: "Industry 4.0", subtopic: "Manufacturing", region: "US", size: "Large" },
  { url: "https://www.themanufacturer.com/feed/", page: "TECHNOLOGY", topic: "Industry 4.0", subtopic: "UK Manufacturing", region: "UK", size: "Medium" },

  // --- Web 3.0 ---
  { url: "https://decrypt.co/feed", page: "TECHNOLOGY", topic: "Web 3.0", subtopic: "Blockchain NFT", region: "Global", size: "Large" },
  { url: "https://cointelegraph.com/rss", page: "TECHNOLOGY", topic: "Web 3.0", subtopic: "Web3 Metaverse", region: "Global", size: "Large" },
  { url: "https://venturebeat.com/category/arvr/feed/", page: "TECHNOLOGY", topic: "Web 3.0", subtopic: "XR Web3 AI", region: "US", size: "Large" },

  // --- Companies ---
  { url: "https://about.fb.com/news/feed/", page: "COMPANIES", topic: "Large Cap", company: "Meta", focus: "VR/MR/Wearables" },
  { url: "https://news.microsoft.com/feed/", page: "COMPANIES", topic: "Large Cap", company: "Microsoft", focus: "MR/Enterprise" },
  { url: "https://developer.apple.com/news/rss/news.rss", page: "COMPANIES", topic: "Large Cap", company: "Apple", focus: "Spatial Computing" },
  { url: "https://blog.google/products/google-ar-vr/rss/", page: "COMPANIES", topic: "Large Cap", company: "Google", focus: "AR/XR Platform" },

  // --- Geographic / Global ---
  { url: "https://yourstory.com/feed", page: "GEOGRAPHIC", topic: "India", region: "India", size: "Large" },
  { url: "https://www.techinasia.com/feed", page: "GEOGRAPHIC", topic: "Singapore", region: "SE Asia", size: "Large" },
  { url: "https://techcrunch.com/feed/", page: "GEOGRAPHIC", topic: "US", region: "US", size: "Large" },
  { url: "https://www.theverge.com/rss/index.xml", page: "GEOGRAPHIC", topic: "US", region: "US", size: "Large" },
  { url: "https://www.bbc.com/news/technology/rss.xml", page: "GEOGRAPHIC", topic: "UK", region: "UK", size: "Large" },
  
  // --- AI ---
  // --- Customer Interaction ---
  { url: "https://www.cmswire.com/rss.xml", page: "CUSTOMER", topic: "CX", subtopic: "Customer Experience" },
  { url: "https://customerthink.com/feed/", page: "CUSTOMER", topic: "CX", subtopic: "Innovation" },
  { url: "https://www.marketingdive.com/feeds/news/", page: "CUSTOMER", topic: "Marketing", subtopic: "News" },

  // --- Global Events (AR, VR, XR, MR, Web 3.0, Industry 4.0) ---
  { url: "https://www.awexr.com/blog/rss", page: "EVENTS", topic: "AWE", subtopic: "AR/VR Events" },
  { url: "https://www.xrtoday.com/tag/xr-events/feed/", page: "EVENTS", topic: "XR Today", subtopic: "Global Events" },
  { url: "https://www.thevrara.com/feed.xml", page: "EVENTS", topic: "VRARA", subtopic: "Chapter Events" },
  { url: "https://www.xra.org/feed/", page: "EVENTS", topic: "XRA", subtopic: "Policy & Events" },
  { url: "https://cointelegraph.com/rss/tag/events", page: "EVENTS", topic: "Web 3.0", subtopic: "Blockchain Events" },
  { url: "https://www.automationworld.com/rss/events", page: "EVENTS", topic: "Industry 4.0", subtopic: "Automation Events" },
  { url: "https://www.eventindustrynews.com/category/event-technology/feed", page: "EVENTS", topic: "Tech Events", subtopic: "Industry News" },

  // --- Products ---
  { url: "https://www.gsmarena.com/rss-news-comments.php3", page: "PRODUCTS", topic: "Hardware", subtopic: "Mobile" },
  { url: "https://9to5google.com/feed/", page: "PRODUCTS", topic: "Software/Hardware", subtopic: "Google" },
  { url: "https://www.macrumors.com/macrumors.xml", page: "PRODUCTS", topic: "Hardware", subtopic: "Apple" }
];

