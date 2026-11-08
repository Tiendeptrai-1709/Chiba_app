import React from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SHADOW } from './ui';

interface Props {
  // Mặc định: logo + "Chiba" (đăng nhập). Có title: biểu tượng ☕ + tiêu đề (đăng ký, quên mật khẩu)
  title?: string;
  subtitle?: string;
  top?: React.ReactNode; // vd. link "Quay lại đăng nhập"
  footer?: React.ReactNode;
  children: React.ReactNode;
}

// Khung chung cho đăng nhập / đăng ký / quên mật khẩu — giống web (nền cam nhạt, thẻ form trắng)
export default function AuthShell({ title, subtitle, top, footer, children }: Props) {
  return (
    <LinearGradient colors={['#FFF7ED', '#FEEFDD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12 gap-8" keyboardShouldPersistTaps="handled">
            {top}
            <View className="items-center">
              {title ? (
                <>
                  <Text style={{ fontSize: 48 }} className="mb-3">
                    ☕
                  </Text>
                  <Text className="text-3xl font-extrabold text-primary">{title}</Text>
                </>
              ) : (
                <>
                  <View style={SHADOW.premium} className="w-24 h-24 rounded-full border border-primary/10 bg-white p-1 mb-4 overflow-hidden">
                    <Image source={require('@/assets/images/logo.png')} style={{ width: '100%', height: '100%', borderRadius: 48 }} />
                  </View>
                  <Text className="text-4xl font-extrabold text-primary">Chiba</Text>
                </>
              )}
              <Text className="text-muted-foreground mt-2 text-sm font-medium tracking-wide">{subtitle ?? 'Tea • Coffee • Foods'}</Text>
            </View>

            <View style={SHADOW.premium} className="bg-card p-6 rounded-2xl border border-border gap-4">
              {children}
            </View>

            {footer}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

export function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
      <Text className="text-destructive text-xs font-semibold">⚠️ {message}</Text>
    </View>
  );
}
