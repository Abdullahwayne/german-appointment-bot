const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const nodemailer = require("nodemailer");

const URL = "https://service2.diplo.de/rktermin/extern/choose_realmList.do?locationCode=kara&request_locale=en";

(async () => {
  try {
    console.log("⏳ Launching browser...");

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: "domcontentloaded" });

    console.log("🌐 Navigated to page.");

    const pageContent = await page.content();

    if (!pageContent.includes("no appointment")) {
      console.log("✅ APPOINTMENT POSSIBLY FOUND!");

      // Email setup
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
        subject: "🟢 Appointment Available!",
        text: "An appointment may be available. Visit the site now:\n" + URL,
      });

      console.log("📬 Email sent.");
    } else {
      console.log("❌ No appointment found.");
    }

    await browser.close();
    console.log("🛑 Browser closed.");
  } catch (err) {
    console.error("❗ Error:", err.message);
  }
})();
