import nodemailer from "nodemailer";
import { ApiError } from "./apiError";

const sendMailOtp = async (email, otp) => {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE == "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transport.sendMail({
      from: `"Wound Tracker" <${process.env.SMTP_USER}>`,
      to: `${email}`,
      subject: `OTP for the Wound tracker`,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; background: #f6f6f6;">
      <div style="max-width: 500px; margin: auto; background: white; padding: 25px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
  
        <h2 style="text-align: center; color: #2C73D2;">Hospital XYZ</h2>
  
        <p style="font-size: 16px; color: #333;">
          Hello,
        </p>
  
        <p style="font-size: 15px; color: #555;">
          Your One-Time Password (OTP) for verification is:
        </p>
  
        <div style="text-align: center; margin: 20px 0;">
          <h1 style="font-size: 40px; letter-spacing: 5px; color: #2C73D2; margin: 0;">
            ${otp}
          </h1>
        </div>
  
        <p style="font-size: 15px; color: #777;">
          This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.
        </p>
  
        <p style="font-size: 15px; color: #777;">
          If you did not request this, please ignore this email or contact support immediately.
        </p>
  
        <br />
  
        <p style="font-size: 14px; text-align: center; color: #aaa;">
          © ${new Date().getFullYear()} Hospital XYZ. All rights reserved.
        </p>
      </div>
    </div>
  `,
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (err) {
    console.error("Error while sending OTP email:", err);
    switch (err.code) {
      case "ECONNECTION":
      case "ETIMEOUT":
        console.error("NETWORK ERROR - retry later");
        throw new ApiError(500, "Network error");
      case "EAUTH":
        throw new ApiError(500, "email authentication failed");
      case "EENVELOPE":
        console.log("INVALID ENVELOPE", err.message, err.rejected || []);
        throw new ApiError(400, "Invalid email address");
      default:
        throw new ApiError(500, "SEND FAILED");
    }
  }
};
