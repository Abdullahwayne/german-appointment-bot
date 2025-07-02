const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const nodemailer = require('nodemailer');

const PAGE_URL = 'https://service2.diplo.de/rktermin/extern/choose_realmList.do?locationCode=kara&request_locale=en';

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = process.env.EMAIL_TO;

(async () => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.goto(PAGE_URL, { waitUntil: 'networkidle2' });

  const text = await page.evaluate(() => document.body.innerText);

  if (!text.includes("No appointment")) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"German Slot Bot" <${EMAIL_USER}>`,
      to: EMAIL_TO,
      subject: "🚨 Slot Available at German Consulate!",
      text: `A slot may be available now!\n\n👉 ${PAGE_URL}`,
    });

    console.log("✅ Email sent!");
  } else {
    console.log("❌ No slot found.");
  }

  await browser.close();
})();
