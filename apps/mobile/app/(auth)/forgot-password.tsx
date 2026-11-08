import React, { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { apiRequest } from '@/lib/api';
import AuthShell, { ErrorBox } from '@/components/AuthShell';
import { Button, COLORS, Field, Notice } from '@/components/ui';

// Gửi email đặt lại mật khẩu. Link trong email mở trang web để đặt mật khẩu mới.
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim()) return setError('Vui lòng nhập email');
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        auth: false,
        body: { email: email.trim().toLowerCase() },
      });
      setMessage(res.message);
    } catch (e: any) {
      setError(e?.message ?? 'Không gửi được yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Quên mật khẩu"
      subtitle="Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu"
      top={
        <Pressable onPress={() => router.replace('/login')} className="flex-row items-center gap-2 self-start">
          <ArrowLeft size={16} color={COLORS.muted} />
          <Text className="text-sm font-semibold text-muted-foreground">Quay lại đăng nhập</Text>
        </Pressable>
      }
    >
      {message ? (
        <Notice tone="success">{message}</Notice>
      ) : (
        <>
          <Field
            label="Email"
            icon={<Mail size={16} color="rgba(107,94,83,0.6)" />}
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            onSubmitEditing={submit}
          />
          <ErrorBox message={error} />
          <Button title={loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'} onPress={submit} loading={loading} className="mt-2" />
        </>
      )}
    </AuthShell>
  );
}
