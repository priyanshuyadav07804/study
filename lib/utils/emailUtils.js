import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendOTPEmail(email, otp) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Email Verification",
      html: `
        <h2>Email Verification</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="letter-spacing: 5px; color: #007bff;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP sent to email successfully" };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return { success: false, message: "Failed to send OTP email" };
  }
}

export async function sendLoginOTPEmail(email, otp) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Login OTP",
      html: `
        <h2>Login Verification</h2>
        <p>Your One-Time Password (OTP) for login is:</p>
        <h1 style="letter-spacing: 5px; color: #28a745;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Login OTP sent to email successfully" };
  } catch (error) {
    console.error("Error sending login OTP email:", error);
    return { success: false, message: "Failed to send login OTP email" };
  }
}

export async function sendWelcomeEmail(email, userName) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to Folder CRUD!",
      html: `
        <h2>Welcome, ${userName}!</h2>
        <p>Your account has been created successfully.</p>
        <p>You can now log in to access all features.</p>
        <p>If you have any questions, feel free to reach out to us.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Welcome email sent successfully" };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, message: "Failed to send welcome email" };
  }
}
