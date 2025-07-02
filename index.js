const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = process.env.EMAIL_TO;

const PAGE_URL = "https://service2.diplo.de/rktermin/..."; // 🔧 Paste the post-CAPTCHA URL

(async () => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.goto(PAGE_URL, { waitUntil: "networkidle2" });

  const text = await page.evaluate(() => document.body.innerText);

  if (!text.includes("No appointment")) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"German Slot Bot" <${EMAIL_USER}>`,
      to: EMAIL_TO,
      subject: "🚨 Slot Available at German Consulate!",
      text: `A slot migh
