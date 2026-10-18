import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Stealth plugin initialize seigirom
puppeteer.use(StealthPlugin());

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
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Page navigation
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Content load aaga chinna delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

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