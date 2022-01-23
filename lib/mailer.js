import nodemailer from 'nodemailer';

export default async function sendMail(html, text) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Scrape City" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      subject: `NAR results for ${new Date().toLocaleString()}`,
      text,
      html,
    });
    console.log('Mail sent successfully');
  } catch (error) {
    console.error(error.message);
  }
}
