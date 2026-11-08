import React, { useCallback, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, BadgeCheck, Phone, ShieldCheck, Star, Trash2, User } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/stores/auth';
import { toast } from '@/lib/stores/toast';
import { formatDateTime, isManager, isStaffMember, PointTransaction, ROLE_LABELS } from '@/lib/types';
import { usePolling } from '@/lib/usePolling';
import { useNavSpace } from '@/components/PillNav';
import { Button, COLORS, SHADOW } from '@/components/ui';

function InfoRow({ label, value, icon, valueClass = 'text-foreground' }: { label: string; value: string; icon: React.ReactNode; valueClass?: string }) {
  return (
    <View className="p-5 flex-row items-center justify-between">
      <View className="gap-1 flex-1">
        <Text className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">{label}</Text>
        <Text className={`font-bold text-sm ${valueClass}`}>{value}</Text>
      </View>
      {icon}
    </View>
  );
}

// Giống web: app/profile/page.tsx
export default function ProfileScreen() {
  const router = useRouter();
  const navSpace = useNavSpace();
  const { user, logout, updateProfile, suspendAccount, deleteAccount, refreshUser } = useAuth();
  const [history, setHistory] = useState<PointTransaction[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inputName, setInputName] = useState('');
  const [inputPhone, setInputPhone] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = useCallback(() => {
    refreshUser();
    apiRequest<PointTransaction[]>('/points/me')
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [refreshUser]);
  usePolling(load, 30_000);

  if (!user) return null;

  const openUpdate = () => {
    setInputName(user.fullName);
    setInputPhone(user.phone ?? '');
    setShowModal(true);
  };

  const saveProfile = async () => {
    if (!inputName.trim()) return;
    setUpdating(true);
    try {
      await updateProfile({ fullName: inputName.trim(), phone: inputPhone.trim() });
      setShowModal(false);
      toast.success('Đã cập nhật thông tin');
    } catch (e: any) {
      toast.error(e?.message ?? 'Không lưu được');
    } finally {
      setUpdating(false);
    }
  };

  const confirmLogout = () =>
    Alert.alert('Đăng xuất?', 'Bạn sẽ cần đăng nhập lại trên máy này.', [
      { text: 'Ở lại', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
    ]);

  const deleteFlow = () =>
    Alert.alert('Xóa tài khoản', 'Tạm ngưng: giữ dữ liệu, đăng xuất mọi thiết bị.\nXóa vĩnh viễn: mất hẳn tài khoản và toàn bộ điểm.', [
      { text: 'Đóng', style: 'cancel' },
      { text: 'Tạm ngưng', onPress: () => suspendAccount().catch((e) => toast.error(e?.message ?? 'Thao tác thất bại')) },
      {
        text: 'Xóa vĩnh viễn',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Xóa vĩnh viễn?', `Mất toàn bộ ${user.zenPoints} điểm và lịch sử. Không thể hoàn tác.`, [
            { text: 'Không', style: 'cancel' },
            { text: 'Xóa', style: 'destructive', onPress: () => deleteAccount().catch((e) => toast.error(e?.message ?? 'Không xóa được')) },
          ]),
      },
    ]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View style={SHADOW.sm} className="bg-card border-b border-border px-4 py-4 flex-row items-center gap-4">
        <Pressable onPress={() => router.navigate('/')} accessibilityLabel="Về trang chủ" className="p-2 border border-border rounded-full">
          <ArrowLeft size={16} color={COLORS.foreground} />
        </Pressable>
        <Text className="text-xl font-bold text-foreground">Thông tin cá nhân</Text>
      </View>

      <ScrollView contentContainerClassName="px-5 py-8 gap-6" contentContainerStyle={{ paddingBottom: navSpace }}>
        {/* Ảnh đại diện */}
        <View style={SHADOW.sm} className="items-center p-6 bg-card border border-border rounded-2xl overflow-hidden">
          <View style={SHADOW.premium} className="w-24 h-24 bg-neutral-200 border-4 border-white rounded-full items-center justify-center mb-4">
            <Text style={{ fontSize: 48 }}>👤</Text>
          </View>
          <Text className="text-2xl font-black text-foreground text-center">{user.fullName}</Text>
          <Text className="text-xs text-muted-foreground mt-1 font-medium">{user.email}</Text>
          {isManager(user.role) && (
            <View className="mt-3 flex-row items-center gap-1 bg-primary px-3 py-1 rounded-full">
              <ShieldCheck size={12} color="#fff" />
              <Text className="text-white text-[10px] font-bold uppercase tracking-wider">{ROLE_LABELS[user.role]}</Text>
            </View>
          )}
        </View>

        {/* Thông tin */}
        <View style={SHADOW.sm} className="bg-card border border-border rounded-2xl overflow-hidden">
          <InfoRow label="Họ và tên" value={user.fullName} icon={<User size={20} color="rgba(107,94,83,0.4)" />} />
          <View className="h-px bg-border" />
          <InfoRow label="Số điện thoại" value={user.phone || 'Chưa cập nhật'} icon={<Phone size={20} color="rgba(107,94,83,0.4)" />} />
          <View className="h-px bg-border" />
          <InfoRow
            label="Mã khách hàng"
            value={user.customerCode}
            valueClass="text-primary tracking-widest"
            icon={<BadgeCheck size={20} color="rgba(30,70,32,0.5)" />}
          />
          <View className="h-px bg-border" />
          <InfoRow label="Điểm Chiba" value={`${user.zenPoints} điểm`} valueClass="text-accent" icon={<Star size={20} color="rgba(216,125,74,0.5)" />} />
        </View>

        {/* Lịch sử điểm */}
        <View style={SHADOW.sm} className="bg-card border border-border rounded-2xl p-5 gap-4">
          <Pressable onPress={() => setShowHistory((v) => !v)} className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Star size={20} color={COLORS.accent} />
              <Text className="font-bold text-sm text-foreground">Lịch sử điểm Chiba</Text>
            </View>
            <Text className="text-xs text-primary font-bold">{showHistory ? 'Thu gọn ▲' : 'Xem chi tiết ▼'}</Text>
          </Pressable>
          {showHistory && (
            <View className="pt-3 border-t border-dashed border-border/60">
              {history.length > 0 ? (
                history.slice(0, 30).map((tx) => {
                  const plus = tx.points >= 0;
                  return (
                    <View key={tx.id} className="flex-row justify-between items-start py-2.5 border-b border-border/40 gap-3">
                      <View className="flex-1 gap-0.5">
                        <Text className="text-xs font-bold text-foreground" numberOfLines={1}>
                          {tx.description}
                        </Text>
                        <Text className="text-[9px] text-muted-foreground">
                          Số dư: {tx.pointsBefore || 0} ➔ {tx.pointsAfter || 0} | {formatDateTime(tx.createdAt)}
                        </Text>
                      </View>
                      <View className={`px-2 py-0.5 rounded ${plus ? 'bg-green-50' : 'bg-red-50'}`}>
                        <Text className={`text-xs font-black ${plus ? 'text-green-600' : 'text-destructive'}`}>
                          {plus ? '+' : ''}
                          {tx.points}
                        </Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text className="text-xs text-muted-foreground text-center py-4">Bạn chưa thực hiện giao dịch tích điểm nào.</Text>
              )}
            </View>
          )}
        </View>

        {/* Nhân viên / quản trị */}
        {isStaffMember(user.role) && (
          <View style={SHADOW.sm} className="bg-card border border-border p-6 rounded-2xl gap-4">
            <Text className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2">⚙️ Tính năng Quản trị</Text>
            <Pressable onPress={() => router.push('/dashboard')} className="p-3 bg-primary rounded-xl items-center">
              <Text className="font-bold text-xs text-white">📊 Bảng điều khiển {isManager(user.role) ? 'Admin' : 'Staff'}</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/stores')} className="p-3 bg-neutral-50 border border-border rounded-xl items-center">
              <Text className="font-bold text-xs text-foreground">📍 Danh sách Cửa Hàng</Text>
            </Pressable>
          </View>
        )}

        {/* Thao tác */}
        <View className="gap-4 pt-4">
          <Pressable onPress={deleteFlow} className="self-center flex-row items-center gap-1">
            <Trash2 size={14} color={COLORS.destructive} />
            <Text className="text-xs text-destructive font-bold">Xóa tài khoản</Text>
          </Pressable>
          <Button title="CẬP NHẬT THÔNG TIN" variant="dark" onPress={openUpdate} className="py-4" textClassName="tracking-wider" />
          <Button title="🚪 Đăng xuất tài khoản" variant="outline" onPress={confirmLogout} textClassName="font-semibold" />
        </View>
      </ScrollView>

      {/* Hộp cập nhật thông tin (giống popup "Chiba xin chào!" của web) */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)} statusBarTranslucent>
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <View style={[SHADOW.modal, { width: '100%', maxWidth: 300 }]} className="bg-card rounded-2xl border border-border overflow-hidden">
            <View className="p-5 gap-2">
              <Text className="text-lg font-bold text-foreground text-center">Chiba xin chào!</Text>
              <Text className="text-xs text-muted-foreground text-center">Cập nhật tên và số điện thoại của bạn</Text>
              <TextInput
                value={inputName}
                onChangeText={setInputName}
                placeholder="Nhập họ và tên..."
                placeholderTextColor="rgba(107,94,83,0.45)"
                autoFocus
                className="w-full px-3 py-2.5 bg-neutral-50 border border-border rounded-lg text-sm text-center mt-3 font-semibold text-foreground"
              />
              <TextInput
                value={inputPhone}
                onChangeText={setInputPhone}
                placeholder="Số điện thoại"
                placeholderTextColor="rgba(107,94,83,0.45)"
                keyboardType="phone-pad"
                className="w-full px-3 py-2.5 bg-neutral-50 border border-border rounded-lg text-sm text-center font-semibold text-foreground"
              />
            </View>
            <View className="flex-row border-t border-border mt-2">
              <Pressable onPress={() => setShowModal(false)} className="flex-1 py-3 items-center border-r border-border">
                <Text className="text-sm text-muted-foreground font-semibold">Bỏ qua</Text>
              </Pressable>
              <Pressable onPress={saveProfile} disabled={updating || !inputName.trim()} className={`flex-1 py-3 items-center ${updating || !inputName.trim() ? 'opacity-40' : ''}`}>
                <Text className="text-sm text-primary font-bold">{updating ? 'Đang lưu...' : 'Đồng ý'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
