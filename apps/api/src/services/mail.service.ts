import { Injectable } from "@nestjs/common";
import nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendResetPasswordEmamil(to: string, resetLink: string) {
    await this.transporter.sendMail({
      from: `Chiba ${process.env.SMTP_USER}`,
      to,
      subject: "Đặt lại mặt khẩu",
      html: `
        <p>Bạn vừa yêu cầu đặt lại mật khẩu.</p>
        <p><a href="${resetLink}">Nhấn vào đây để đặt lại mật khẩu</a></p>
        <p>Link này sẽ hết hạn sau 15 phút. Nếu không phải bạn yêu cầu, hãy bỏ qua email này.</p>
      `,
    });
  }
}
