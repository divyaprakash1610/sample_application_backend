import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import env from 'dotenv';
@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER, // your Gmail
      pass: process.env.MAIL_PASS, // your app password
    },
  });

  async sendOtpEmail(email: string, otp: string) {
    const mailOptions = {
      from: `"Sample App OTP" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
    };

    return await this.transporter.sendMail(mailOptions);
  }
   async sendErrorEmail(adminEmail: string, partName: string, projectName: string, stepName: string, errorDetails: string) {
    const mailOptions = {
      from: `"Sample App Error" <${process.env.MAIL_USER}>`,
      to: adminEmail,
      subject: `Error in Validation - ${partName}`,
      html: `
        <p>An error occurred during validation.</p>
        <p><strong>Part:</strong> ${partName}</p>
        <p><strong>Project:</strong> ${projectName}</p>
        <p><strong>Step:</strong> ${stepName}</p>
        <p><strong>Error Details:</strong> ${errorDetails}</p>
        <p>Please review the issue immediately.</p>
      `,
    };
    return await this.transporter.sendMail(mailOptions);
  }
}
