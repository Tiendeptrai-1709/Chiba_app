import { Injectable, Logger } from "@nestjs/common";
import nodemailer, { Transporter } from "nodemailer";

// Gửi email qua SMTP (Gmail, Zoho, SendGrid, Amazon SES… đều có SMTP).
// Chưa cấu hình SMTP_HOST → không gửi, chỉ in nội dung ra log server để test ở máy dev.
@Injectable()
export class MailService {
  private readonly logger = new Logger("Mail");
  private readonly transporter: Transporter | null;
  private readonly from = process.env.MAIL_FROM ?? "Chiba <no-reply@chiba.local>";

  constructor() {
    const host = process.env.SMTP_HOST;
    this.transporter = host
      ? nodemailer.createTransport({
          host,
          port: Number(process.env.SMTP_PORT ?? 587),
          secure: process.env.SMTP_SECURE === "true", // true cho cổng 465
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        })
      : null;
  }

  get isConfigured() {
    return this.transporter !== null;
  }

  async sendPasswordReset(to: string, fullName: string, link: string) {
    const subject = "Đặt lại mật khẩu Chiba";
    const text = [
      `Xin chào ${fullName},`,
      "",
      "Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu tài khoản Chiba.",
      `Mở liên kết sau trong 15 phút để đặt mật khẩu mới:`,
      link,
      "",
      "Nếu không phải bạn yêu cầu, hãy bỏ qua email này — mật khẩu cũ vẫn giữ nguyên.",
    ].join("\n");

    if (!this.transporter) {
      this.logger.warn(`Chưa cấu hình SMTP — không gửi email. Link đặt lại mật khẩu cho ${to}:\n${link}`);
      return;
    }
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      text,
      html: `<p>Xin chào ${escapeHtml(fullName)},</p>
<p>Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu tài khoản Chiba.</p>
<p><a href="${escapeHtml(link)}">Bấm vào đây để đặt mật khẩu mới</a> (hết hạn sau 15 phút).</p>
<p>Nếu không phải bạn yêu cầu, hãy bỏ qua email này — mật khẩu cũ vẫn giữ nguyên.</p>`,
    });
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
