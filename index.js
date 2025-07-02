const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const nodemailer = require("nodemailer");

const URL = "https://service2.diplo.de/rktermin/extern/choose_realmList.do?locationCode=kara&request_locale=en";

(async () => {
  try {
    console.log("⏳ Launching browser...");

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    console.log("🌐 Navigating to appointment page...");
    await page.goto(URL, { waitUntil: "networkidle0" });

    const content = await page.content();

    if (!content.includes("no appointment")) {
      console.log("✅ APPOINTMENT POSSIBLY FOUND!");

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: "🟢 German Appointment May Be Available!",
        text: `Visit the page: ${URL}`,
      });

      console.log("📬 Email sent.");
    } else {
      console.log("❌ No appointment found.");
    }

    await browser.close();
    console.log("🛑 Browser closed.");
  } catch (err) {
    console.error("❗ Error during check:", err.message);
  }
})();
