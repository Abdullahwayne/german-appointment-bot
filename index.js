const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = process.env.EMAIL_TO;

// 🔧 UPDATE THIS: Paste your post-CAPTCHA URL here
const PAGE_URL = "https://service2.diplo.de/rktermin/extern/appointment_showMonth.do?locationCode=kara&realmId=1116&categoryId=2339&dateStr=30.08.2025";

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(PAGE_URL, { waitUntil: "networkidle2" });

  const text = await page.evaluate(() => document.body.innerText);
  if (!text.includes("No appointment")) {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Appointment Alert" <${EMAIL_USER}>`,
      to: EMAIL_TO,
      subject: "🚨 Appointment Slot Available!",
      text: `🎯 A slot is now available! Visit: ${PAGE_URL}`,
    });
    console.log("✅ Email sent!");
  } else {
    console.log("❌ No slot yet.");
  }
  await browser.close();
})();
