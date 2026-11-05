// Thông tin tài khoản nhận chuyển khoản của cửa hàng.
// Khai báo trong apps/web/.env.local (xem apps/web/.env.example):
//   NEXT_PUBLIC_BANK_ID            Mã ngân hàng theo VietQR, vd. "VCB", "TCB", "MB" hoặc BIN "970436"
//   NEXT_PUBLIC_BANK_ACCOUNT_NO    Số tài khoản
//   NEXT_PUBLIC_BANK_ACCOUNT_NAME  Tên chủ tài khoản (không dấu, viết hoa)
export const bankConfig = {
  bankId: process.env.NEXT_PUBLIC_BANK_ID ?? '',
  accountNo: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO ?? '',
  accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? '',
};

export const isBankConfigured = () => !!(bankConfig.bankId && bankConfig.accountNo);

// Ảnh QR chuyển khoản theo chuẩn VietQR (napas247) — app ngân hàng nào cũng quét được.
// Ảnh được tạo bởi dịch vụ công khai img.vietqr.io từ thông tin trên.
export function vietQrImageUrl(amount: number, content: string): string | null {
  if (!isBankConfigured()) return null;
  const params = new URLSearchParams({
    amount: String(amount),
    addInfo: content,
    accountName: bankConfig.accountName,
  });
  return `https://img.vietqr.io/image/${encodeURIComponent(bankConfig.bankId)}-${encodeURIComponent(
    bankConfig.accountNo,
  )}-compact2.png?${params.toString()}`;
}
