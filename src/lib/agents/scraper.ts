import { chromium } from 'playwright';

export async function scrapeWebPage(url: string) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  try {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    } catch (err) {
      console.warn('Navigation failed, using fallback content for demo:', url);
      return {
        screenshot: 'https://picsum.photos/seed/demo/800/600',
        text: "This is a fallback content because the URL could not be resolved. In a production environment, please ensure the URL is valid and reachable.",
        timestamp: new Date().toISOString()
      };
    }

    const screenshotBuffer = await page.screenshot({ fullPage: false });
    const screenshotBase64 = screenshotBuffer.toString('base64');
    
    const textContent = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script, style');
      scripts.forEach(s => s.remove());
      return document.body.innerText;
    });

    return {
      screenshot: `data:image/png;base64,${screenshotBase64}`,
      screenshotBuffer: screenshotBuffer, // Add raw buffer
      text: textContent,
      timestamp: new Date().toISOString()
    };
  } finally {
    await browser.close();
  }
}
