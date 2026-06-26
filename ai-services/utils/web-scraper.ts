import axios from 'axios';
import * as cheerio from 'cheerio';
import config from '../config';

interface ScrapeOptions {
  url: string;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  parseHtml?: boolean;
}

interface ScrapeResult {
  html?: string;
  text?: string;
  title?: string;
  metaTags?: Record<string, string>;
  links?: string[];
  images?: string[];
  error?: string;
}

/**
 * Web scraping utility with rate limiting and error handling
 */
export async function scrapeWebPage(options: ScrapeOptions): Promise<ScrapeResult> {
  const {
    url,
    headers = {},
    timeout = config.scraper.timeout,
    retries = 2,
    parseHtml = true,
  } = options;

  const defaultHeaders = {
    'User-Agent': config.scraper.userAgent,
    'Accept-Language': 'ar,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Cache-Control': 'no-cache',
    ...headers,
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Rate limiting - wait between requests
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, config.scraper.rateLimit));
      }

      const response = await axios.get(url, {
        headers: defaultHeaders,
        timeout,
        responseType: 'text',
        validateStatus: (status) => status < 400,
      });

      if (!parseHtml) {
        return { text: response.data };
      }

      const $ = cheerio.load(response.data);

      // Extract basic info
      const title = $('title').first().text().trim();
      const metaTags: Record<string, string> = {};
      $('meta').each((_, el) => {
        const name = $(el).attr('name') || $(el).attr('property') || '';
        const content = $(el).attr('content') || '';
        if (name && content) {
          metaTags[name] = content;
        }
      });

      // Extract links
      const links: string[] = [];
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          try {
            const absoluteUrl = new URL(href, url).href;
            links.push(absoluteUrl);
          } catch {
            // Skip invalid URLs
          }
        }
      });

      // Extract images
      const images: string[] = [];
      $('img[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (src) {
          try {
            const absoluteUrl = new URL(src, url).href;
            images.push(absoluteUrl);
          } catch {
            // Skip invalid URLs
          }
        }
      });

      // Clean text content
      $('script, style, nav, footer, header, iframe').remove();
      const text = $('body').text()
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      return {
        html: response.data,
        text,
        title,
        metaTags,
        links: [...new Set(links)].slice(0, 100),
        images: [...new Set(images)].slice(0, 50),
      };

    } catch (error: any) {
      if (attempt === retries) {
        return {
          error: `فشل في جلب البيانات: ${error.message}`,
        };
      }
      console.warn(`Scrape attempt ${attempt + 1} failed for ${url}: ${error.message}`);
    }
  }

  return { error: 'فشل في جلب البيانات بعد عدة محاولات' };
}

/**
 * Scrape multiple URLs in parallel with concurrency limit
 */
export async function scrapeMultipleUrls(
  urls: string[],
  options?: Omit<ScrapeOptions, 'url'>,
  concurrency: number = 3
): Promise<Map<string, ScrapeResult>> {
  const results = new Map<string, ScrapeResult>();
  const queue = [...urls];

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift()!;
      if (!results.has(url)) {
        const result = await scrapeWebPage({ ...options, url });
        results.set(url, result);
      }
    }
  }

  const workers = Array(Math.min(concurrency, urls.length)).fill(null).map(() => worker());
  await Promise.all(workers);

  return results;
}

export default { scrapeWebPage, scrapeMultipleUrls };
