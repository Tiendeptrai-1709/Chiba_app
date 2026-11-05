// TẠM THỜI: danh sách lời mời nhân viên chưa có API backend, chỉ lưu trong
// localStorage của trình duyệt hiện tại. Admin tạo nhân viên thật qua POST /users.
const STAFF_INVITES_KEY = 'zen_fb_invited_staff';

function read<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const getLocalInvites = () => read<string[]>(STAFF_INVITES_KEY, []);
export const saveLocalInvites = (invites: string[]) => write(STAFF_INVITES_KEY, invites);
