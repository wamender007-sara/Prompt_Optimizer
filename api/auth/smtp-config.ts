import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { gmailUser, gmailAppPassword } = req.body || {};
    if (!gmailUser || !gmailUser.includes('@') || !gmailAppPassword) {
      return res.status(400).json({ error: 'Please provide both a valid Gmail address and 16-character Google App Password.' });
    }

    const cleanUser = gmailUser.trim().toLowerCase();
    const cleanPass = gmailAppPassword.replace(/\s+/g, '');

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: cleanUser,
        pass: cleanPass,
      },
    });

    await transporter.verify();

    process.env.GMAIL_USER = cleanUser;
    process.env.GMAIL_APP_PASSWORD = cleanPass;

    return res.status(200).json({
      success: true,
      configured: true,
      gmailUser: cleanUser,
      message: `Gmail SMTP verified and connected for ${cleanUser}!`
    });
  } catch (err: any) {
    return res.status(400).json({
      error: `Gmail SMTP authentication failed: ${err?.message || 'Invalid App Password'}. Make sure 2-Step Verification is enabled and you are using a 16-character Google App Password.`
    });
  }
}
