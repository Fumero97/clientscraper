import { chromium } from 'playwright';

export async function scrapeWebPage(url: string) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 800, height: 600 }, // Reduce specific for faster layout
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });
  const page = await context.newPage();
  
  try {
    // Block heavy resources
    await page.route('**/*.{png,jpg,jpeg,gif,webp,svg,css,woff,woff2,ttf}', route => route.abort());

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch (err) {
      console.warn('Navigation failed, using fallback content for demo:', url);
      return {
        screenshot: null,
        text: "This is a fallback content because the URL could not be resolved. In a production environment, please ensure the URL is valid and reachable.",
        timestamp: new Date().toISOString()
      };
    }

    const textContent = await page.evaluate(() => {
      // Remove noise
      const scripts = document.querySelectorAll('script, style, nav, footer, iframe, noscript');
      scripts.forEach(s => s.remove());
      return document.body.innerText.replace(/\s+/g, ' ').trim();
    });

    return {
      screenshot: null, // Optimization: Screenshots disabled as they are not currently stored
      text: textContent,
      timestamp: new Date().toISOString()
    };
  } finally {
    await browser.close();
  }
}
