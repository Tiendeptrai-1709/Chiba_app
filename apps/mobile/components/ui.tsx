// Thành phần giao diện dùng chung — làm theo giao diện web (apps/web), cùng màu, bo góc, đổ bóng.
import React from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ShoppingBag } from 'lucide-react-native';
import { cartTotals, useCart } from '@/lib/stores/cart';
import { cn } from '@/lib/utils';

export const COLORS = {
  primary: '#1E4620',
  primaryDark: '#163418',
  accent: '#D87D4A',
  accentStrong: '#9A4A1F',
  foreground: '#1F1914',
  muted: '#6B5E53',
  border: '#EDE6DF',
  background: '#FAF7F5',
  destructive: '#C82333',
  caramel: '#E6EFE2',
  cream: '#FFFCF8',
};

// Đổ bóng giống web (shadow-premium / floating / modal)
export const SHADOW: Record<'premium' | 'floating' | 'modal' | 'sm', ViewStyle> = {
  sm: { boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)' },
  premium: { boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)' },
  floating: { boxShadow: '0 10px 40px rgba(0, 0, 0, 0.10)' },
  modal: { boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)' },
};

// Chuyển màu xanh của banner / thẻ thành viên
export const GREEN_GRADIENT = [COLORS.primary, '#2A5C2D', COLORS.primaryDark] as const;

// Khung màn hình: chừa tai thỏ / thanh trạng thái ở trên
export function Screen({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <SafeAreaView edges={['top']} className={cn('flex-1 bg-background', className)}>
      {children}
    </SafeAreaView>
  );
}

// Nút tròn trắng có bóng (quay lại, giỏ hàng, tải lại...)
export function RoundButton({ onPress, label, children }: { onPress: () => void; label: string; children: React.ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={SHADOW.premium}
      className="w-11 h-11 rounded-full bg-card items-center justify-center active:opacity-70"
    >
      {children}
    </Pressable>
  );
}

export function CartButton({ size = 44 }: { size?: number }) {
  const router = useRouter();
  const { totalItems } = cartTotals(useCart((s) => s.items));
  return (
    <Pressable
      onPress={() => router.push('/cart')}
      accessibilityLabel={`Giỏ hàng (${totalItems} món)`}
      style={[SHADOW.premium, { width: size, height: size }]}
      className="rounded-full bg-card items-center justify-center active:opacity-70"
    >
      <ShoppingBag size={20} color={COLORS.primary} />
      {totalItems > 0 && (
        <View className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-accent items-center justify-center border-2 border-background">
          <Text className="text-[10px] font-bold text-white">{totalItems}</Text>
        </View>
      )}
    </Pressable>
  );
}

// Thanh tiêu đề kiểu web: nút tròn bên trái, tiêu đề giữa, nút / ô trống bên phải
export function PageHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  const router = useRouter();
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  return (
    <View className="flex-row items-center justify-between px-5 pt-3 pb-3">
      <RoundButton onPress={back} label="Quay lại">
        <ArrowLeft size={20} color={COLORS.primary} />
      </RoundButton>
      <Text className="text-lg font-bold text-foreground" numberOfLines={1}>
        {title}
      </Text>
      {right ?? <View className="w-11" />}
    </View>
  );
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger' | 'ghost' | 'dark' | 'soft';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  textClassName?: string;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, icon, className, textClassName }: ButtonProps) {
  const box = {
    primary: 'bg-primary',
    outline: 'bg-neutral-50 border border-border',
    danger: 'bg-card border border-destructive/40',
    ghost: 'bg-transparent',
    dark: 'bg-[#1A1A1A]',
    soft: 'bg-caramel',
  }[variant];
  const text = {
    primary: 'text-white',
    outline: 'text-foreground',
    danger: 'text-destructive',
    ghost: 'text-primary',
    dark: 'text-white',
    soft: 'text-caramel-foreground',
  }[variant];
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      style={variant === 'primary' || variant === 'dark' ? SHADOW.premium : undefined}
      className={cn('min-h-[52px] rounded-xl flex-row items-center justify-center gap-2 px-5 py-3.5 active:opacity-80', box, off && 'opacity-50', className)}
    >
      {loading ? <ActivityIndicator color={variant === 'primary' || variant === 'dark' ? '#fff' : COLORS.primary} /> : icon}
      <Text className={cn('font-bold text-sm', text, textClassName)}>{title}</Text>
    </Pressable>
  );
}

interface FieldProps extends TextInputProps {
  label: string;
  icon?: React.ReactNode;
  right?: React.ReactNode; // vd. link "Quên mật khẩu?" cạnh nhãn
}

// Ô nhập kiểu web: nhãn chữ hoa nhỏ, nền xám nhạt, icon bên trái
export function Field({ label, icon, right, className, ...props }: FieldProps) {
  return (
    <View>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</Text>
        {right}
      </View>
      <View className="justify-center">
        {icon ? <View className="absolute left-3.5 z-10">{icon}</View> : null}
        <TextInput
          placeholderTextColor="rgba(107, 94, 83, 0.6)"
          className={cn('min-h-[48px] pr-4 py-3 bg-neutral-50 border border-border rounded-xl text-sm text-foreground', icon ? 'pl-10' : 'pl-4', className)}
          {...props}
        />
      </View>
    </View>
  );
}

// Thẻ trắng bo góc; `section` = thẻ có tiêu đề chữ xanh đậm như các khối trong giỏ hàng web
export function Card({ children, className, style }: { children: React.ReactNode; className?: string; style?: ViewStyle }) {
  return (
    <View style={[SHADOW.sm, style]} className={cn('bg-card border border-border rounded-2xl p-5', className)}>
      {children}
    </View>
  );
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between border-b border-border/40 pb-2.5 mb-4">
      <Text className="text-xs font-black text-primary uppercase tracking-widest flex-1">{children}</Text>
      {right}
    </View>
  );
}

// Nút chọn dạng viên thuốc (độ ngọt, đá, danh mục...)
export function Chip({ label, active, onPress, tone = 'primary' }: { label: string; active: boolean; onPress: () => void; tone?: 'primary' | 'caramel' }) {
  const on = tone === 'caramel' ? 'bg-caramel' : 'bg-primary border border-primary';
  const onText = tone === 'caramel' ? 'text-caramel-foreground' : 'text-white';
  const off = tone === 'caramel' ? 'bg-card' : 'bg-card border border-border';
  return (
    <Pressable
      onPress={onPress}
      accessibilityState={{ selected: active }}
      style={active && tone === 'caramel' ? SHADOW.sm : undefined}
      className={cn(tone === 'caramel' ? 'px-5 py-3' : 'px-3.5 py-2', 'rounded-full', active ? on : off)}
    >
      <Text className={cn('text-sm font-semibold', active ? onText : 'text-foreground/80')}>{label}</Text>
    </Pressable>
  );
}

export function Loading({ text = 'Đang tải...' }: { text?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-background gap-3">
      <ActivityIndicator color={COLORS.primary} />
      <Text className="text-xs text-muted-foreground font-semibold">{text}</Text>
    </View>
  );
}

export function Row({ label, value, tone }: { label: string; value: string; tone?: 'accent' | 'primary' }) {
  return (
    <View className="flex-row justify-between py-1">
      <Text className={cn('text-xs font-medium', tone === 'accent' ? 'text-accent-strong font-semibold' : 'text-muted-foreground')}>{label}</Text>
      <Text className={cn('text-xs font-bold', tone === 'accent' ? 'text-accent-strong' : tone === 'primary' ? 'text-primary' : 'text-foreground')}>
        {value}
      </Text>
    </View>
  );
}

// Nhãn trạng thái / thông báo nhỏ trên nền màu
export function Notice({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'error' | 'success' | 'warm' }) {
  const box = {
    muted: 'bg-neutral-50 border border-dashed border-border',
    error: 'bg-destructive/10 border border-destructive/20',
    success: 'bg-emerald-50',
    warm: 'bg-orange-50 border border-orange-100',
  }[tone];
  const text = {
    muted: 'text-muted-foreground',
    error: 'text-destructive font-semibold',
    success: 'text-emerald-800 font-semibold',
    warm: 'text-accent-strong font-semibold',
  }[tone];
  return (
    <View className={cn('rounded-xl p-3', box)}>
      <Text className={cn('text-xs leading-5', text)}>{children}</Text>
    </View>
  );
}
