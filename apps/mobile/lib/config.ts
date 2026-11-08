import Constants from 'expo-constants';

// Địa chỉ API.
// - Đặt EXPO_PUBLIC_API_URL trong apps/mobile/.env để chỉ định (vd. link Railway, hoặc
//   https://xxx.trycloudflare.com/api khi test qua link tạm của web).
// - Không đặt: khi chạy `npx expo start`, điện thoại đang nói chuyện với máy tính qua IP mạng LAN,
//   nên API được đoán là cùng IP đó, cổng 3001.
function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return host ? `http://${host}:3001` : 'http://localhost:3001';
}

export const API_URL = resolveApiUrl();

// Tài khoản nhận chuyển khoản (giống NEXT_PUBLIC_BANK_* bên web)
export const bankConfig = {
  bankId: process.env.EXPO_PUBLIC_BANK_ID ?? '',
  accountNo: process.env.EXPO_PUBLIC_BANK_ACCOUNT_NO ?? '',
  accountName: process.env.EXPO_PUBLIC_BANK_ACCOUNT_NAME ?? '',
};

// Ảnh QR chuyển khoản chuẩn VietQR (img.vietqr.io) — app ngân hàng nào cũng quét được.
export function vietQrImageUrl(amount: number, content: string): string | null {
  if (!bankConfig.bankId || !bankConfig.accountNo) return null;
  const q = `amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(bankConfig.accountName)}`;
  return `https://img.vietqr.io/image/${encodeURIComponent(bankConfig.bankId)}-${encodeURIComponent(bankConfig.accountNo)}-compact2.png?${q}`;
}
