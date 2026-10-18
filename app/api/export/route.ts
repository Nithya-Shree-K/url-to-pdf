import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: NextRequest) {
  try {
    const { url, format } = await req.json();

    if (!url || !url.startsWith("http")) {
      return NextResponse.json(
        { error: "Valid URL (http illai https) thevai." },
        { status: 400 }
      );
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // User-agent set panrom (websites block pannama irukka)
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // domcontentloaded mattum wait pannum (romba fast-aa load aagum, timeout aagadhu)
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Page render aaga 2 seconds chinna delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (format === "pdf") {
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
      });
      await browser.close();

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
      await browser.close();

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
  }
}