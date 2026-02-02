import { chromium } from 'playwright';

export async function scrapeWebPage(url: string) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  try {
    // Block images and fonts for speed, but keep scripts and CSS for layout/content loading
    await page.route('**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf}', route => route.abort());

    console.log(`📡 Navigating to: ${url}`);
    
    // Use a more robust wait strategy
    const response = await page.goto(url, { 
      waitUntil: 'networkidle', 
      timeout: 30000 
    });

    if (!response || response.status() >= 400) {
      throw new Error(`Failed to load page: ${response?.status() || 'Unknown error'}`);
    }

    // Scroll to the bottom to trigger any lazy-loaded content (common in modern sites)
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve(true);
          }
        }, 50);
      });
    });

    // Extract text specifically targeting semantic main content if possible
    const textContent = await page.evaluate(() => {
      // Create a clone to avoid messing with the actual page visibility
      const body = document.body.cloneNode(true) as HTMLElement;
      
      // Remove scripts, styles, and invisible elements
      const toRemove = body.querySelectorAll('script, style, iframe, noscript, [aria-hidden="true"], [style*="display: none"]');
      toRemove.forEach(el => el.remove());

      // We DON'T remove nav/footer here because sometimes they contain important context
      // but we do try to prioritize the "main" area if it exists
      const main = body.querySelector('main, #content, .content, #main, article');
      if (main) {
        return (main as HTMLElement).innerText.replace(/\s+/g, ' ').trim();
      }
      
      return body.innerText.replace(/\s+/g, ' ').trim();
    });

    return {
      screenshot: null,
      text: textContent,
      timestamp: new Date().toISOString()
    };
  } catch (err: any) {
    console.warn(`⚠️ Scraping failed for ${url}:`, err.message);
    return {
      screenshot: null,
      text: `ERROR_SCRAPING: ${err.message}`,
      timestamp: new Date().toISOString()
    };
  } finally {
    await browser.close();
  }
}

