import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Link } from 'expo-router';
import { ArrowRight, Lock, Mail } from 'lucide-react-native';
import { useAuth } from '@/lib/stores/auth';
import AuthShell, { ErrorBox } from '@/components/AuthShell';
import { Button, Field } from '@/components/ui';

const ICON = 'rgba(107,94,83,0.6)';

// Giống web: app/page.tsx
export default function LoginScreen() {
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) return setError('Vui lòng nhập đầy đủ thông tin');
    setLoading(true);
    setError(null);
    try {
      await login(email, password); // thành công → _layout tự chuyển về trang chủ
    } catch (e: any) {
      setError(e?.message ?? 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      footer={
        <View className="flex-row justify-center gap-1">
          <Text className="text-sm text-muted-foreground">Chưa có tài khoản?</Text>
          <Link href="/register" asChild>
            <Text className="text-sm font-bold text-primary">Đăng ký ngay</Text>
          </Link>
        </View>
      }
    >
      <Field
        label="Tài khoản Email"
        icon={<Mail size={16} color={ICON} />}
        value={email}
        onChangeText={setEmail}
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <Field
        label="Mật khẩu"
        icon={<Lock size={16} color={ICON} />}
        right={
          <Link href="/forgot-password" asChild>
            <Text className="text-xs font-semibold text-primary">Quên mật khẩu?</Text>
          </Link>
        }
        value={password}
        onChangeText={setPassword}
        placeholder="Nhập 6 ký tự"
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        onSubmitEditing={submit}
        returnKeyType="go"
      />
      <ErrorBox message={error} />
      <Button
        title={loading ? 'Đang xác thực...' : 'Đăng Nhập'}
        onPress={submit}
        loading={loading}
        className="mt-2 flex-row-reverse"
        icon={!loading && <ArrowRight size={16} color="#fff" />}
      />
    </AuthShell>
  );
}
