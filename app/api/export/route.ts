import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: NextRequest) {
  let browser;
  try {
    const { url, format } = await req.json();

    if (!url || !url.startsWith("http")) {
      return NextResponse.json(
        { error: "Valid URL (http illai https) thevai." },
        { status: 400 }
      );
    }

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    const page = await browser.newPage();

    // Real Chrome User-Agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    // Automation flag 'navigator.webdriver' hide seigirom
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });
    });

    // Browser headers
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      "Upgrade-Insecure-Requests": "1",
    });

    await page.setViewport({ width: 1280, height: 800 });

    // Page navigation
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Page render aaga chinna delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (format === "pdf") {
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
      });

      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="webpage.pdf"',
        },
      });
    } else {
      const imageBuffer = await page.screenshot({
        fullPage: true,
        type: "png",
      });

      return new NextResponse(Buffer.from(imageBuffer), {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": 'attachment; filename="screenshot.png"',
        },
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}