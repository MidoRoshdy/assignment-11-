import nodemailer from "nodemailer";
import { env } from "../../../config/env.service.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.email,
    pass: env.emailPass,
  },
});

export const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: env.email,
    to: email,
    subject: "Account Verification OTP",
    text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
    html: `<p>Your verification code is: <strong>${otp}</strong></p><p>It expires in 10 minutes.</p>`,
  });
};
