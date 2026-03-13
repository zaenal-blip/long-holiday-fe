import puppeteer from 'puppeteer';

const capture = async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        console.log("Navigating to Dashboard...");
        await page.goto("http://localhost:5173/dashboard", { waitUntil: "networkidle0" });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: "C:\\Users\\arif4\\.gemini\\antigravity\\brain\\d860f661-4623-4122-8ad1-926d47c5573b\\dashboard_daytype_verification.png" });

        console.log("Navigating to Review...");
        await page.goto("http://localhost:5173/review", { waitUntil: "networkidle0" });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: "C:\\Users\\arif4\\.gemini\\antigravity\\brain\\d860f661-4623-4122-8ad1-926d47c5573b\\review_daytype_verification.png" });

        console.log("Navigating to Input5M Step 1...");
        await page.goto("http://localhost:5173/input-5m?dept=Production", { waitUntil: "networkidle0" });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: "C:\\Users\\arif4\\.gemini\\antigravity\\brain\\d860f661-4623-4122-8ad1-926d47c5573b\\input_step1_verification.png" });

        console.log("Done capturing screenshots.");
    } catch (error) {
        console.error("Capture failed", error);
    } finally {
        await browser.close();
    }
};

capture();
