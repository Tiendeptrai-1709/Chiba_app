"use client";

import { useState, FormEvent } from "react";
import { useForgotPassword } from "@/hooks/useAuth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { mutate, isPending, isSuccess } = useForgotPassword();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutate(email);
    console.log("first")
  }

  if (isSuccess) {
    return (
      <div className="max-w-sm mx-auto px-6 py-16 text-center">
        <p>Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu. Kiểm tra hộp thư của bạn.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto px-6 py-16 space-y-4">
      <h1 className="text-2xl font-bold">Quên mật khẩu</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-lg border text-white border-zinc-700 bg-zinc-900 px-3 py-2"
        required
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
      </button>
    </form>
  );
}