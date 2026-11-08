import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ArrowLeft, Lock, Mail, User } from 'lucide-react-native';
import { useAuth } from '@/lib/stores/auth';
import AuthShell, { ErrorBox } from '@/components/AuthShell';
import { Button, COLORS, Field } from '@/components/ui';

const ICON = 'rgba(107,94,83,0.6)';

// Giống web: app/register/page.tsx
export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuth((s) => s.register);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!fullName.trim() || !email.trim() || !password) return setError('Vui lòng nhập đầy đủ thông tin');
    if (password.length < 6) return setError('Mật khẩu tối thiểu 6 ký tự');
    if (password !== confirm) return setError('Mật khẩu nhập lại không khớp');
    setLoading(true);
    setError(null);
    try {
      await register({ fullName, email, password });
    } catch (e: any) {
      setError(e?.message ?? 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Tạo tài khoản"
      subtitle="Gia nhập ngôi nhà Chiba"
      top={
        <Pressable onPress={() => router.replace('/login')} className="flex-row items-center gap-2 self-start">
          <ArrowLeft size={16} color={COLORS.muted} />
          <Text className="text-sm font-semibold text-muted-foreground">Quay lại đăng nhập</Text>
        </Pressable>
      }
      footer={
        <View className="flex-row justify-center gap-1">
          <Text className="text-sm text-muted-foreground">Đã có tài khoản?</Text>
          <Link href="/login" asChild>
            <Text className="text-sm font-bold text-primary">Đăng nhập</Text>
          </Link>
        </View>
      }
    >
      <Field label="Họ và tên" icon={<User size={16} color={ICON} />} value={fullName} onChangeText={setFullName} placeholder="Họ và tên của bạn" autoComplete="name" />
      <Field
        label="Email"
        icon={<Mail size={16} color={ICON} />}
        value={email}
        onChangeText={setEmail}
        placeholder="nhapemail@domain.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <Field
        label="Mật khẩu"
        icon={<Lock size={16} color={ICON} />}
        value={password}
        onChangeText={setPassword}
        placeholder="Ít nhất 6 ký tự"
        secureTextEntry
        autoComplete="new-password"
      />
      <Field
        label="Nhập lại mật khẩu"
        icon={<Lock size={16} color={ICON} />}
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Gõ lại mật khẩu phía trên"
        secureTextEntry
        autoComplete="new-password"
        onSubmitEditing={submit}
      />
      <ErrorBox message={error} />
      <Button title={loading ? 'Đang tạo tài khoản...' : 'Đăng ký'} onPress={submit} loading={loading} className="mt-2" />
    </AuthShell>
  );
}
