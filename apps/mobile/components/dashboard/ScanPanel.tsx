import React, { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Camera, CameraOff, Coins, Gift, Keyboard, RotateCcw, Search } from 'lucide-react-native';
import { apiRequest } from '@/lib/api';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/stores/toast';
import { PointTransaction, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button, Card, COLORS } from '@/components/ui';

const CODE_PATTERN = /^Z\d{8}$/;
const VND_PER_EARNED_POINT = 10_000; // khớp backend

// Giống web: components/dashboard/QrScanPanel.tsx — quét mã khách để tích điểm / đổi quà tại quầy
export default function ScanPanel() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOn, setCameraOn] = useState(false);
  const scanned = useRef(false); // chặn quét trùng khi camera đọc liên tục
  const [manualCode, setManualCode] = useState('');
  const [customer, setCustomer] = useState<User | null>(null);
  const [looking, setLooking] = useState(false);
  const [billAmount, setBillAmount] = useState('');
  const [redeemPoints, setRedeemPoints] = useState('');
  const [redeemReason, setRedeemReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastTx, setLastTx] = useState<PointTransaction | null>(null);

  const lookup = useCallback(async (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (!CODE_PATTERN.test(normalized)) return toast.error('Mã khách hàng có dạng Z + 8 chữ số, ví dụ Z12345678');
    setLooking(true);
    setLastTx(null);
    try {
      setCustomer(await apiRequest<User>(`/users/by-code/${encodeURIComponent(normalized)}`));
      setManualCode(normalized);
    } catch (e: any) {
      setCustomer(null);
      toast.error(e?.message ?? 'Không tìm thấy khách hàng');
    } finally {
      setLooking(false);
    }
  }, []);

  const openCamera = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) return toast.error('Cần cho phép camera để quét mã. Hoặc nhập mã thủ công bên dưới.');
    }
    scanned.current = false;
    setCameraOn(true);
  };

  const onScanned = ({ data }: { data: string }) => {
    const text = data.trim().toUpperCase();
    if (scanned.current || !CODE_PATTERN.test(text)) return;
    scanned.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setCameraOn(false);
    lookup(text);
  };

  const reset = () => {
    setCustomer(null);
    setManualCode('');
    setBillAmount('');
    setRedeemPoints('');
    setRedeemReason('');
    setLastTx(null);
  };

  const bill = parseInt(billAmount.replace(/\D/g, ''), 10) || 0;
  const previewPoints = Math.floor(bill / VND_PER_EARNED_POINT);

  const earn = async () => {
    if (!customer) return;
    if (bill < VND_PER_EARNED_POINT) return toast.error('Hóa đơn tối thiểu 10.000đ mới được tích điểm');
    if (!(await confirm('Tích điểm', `Cộng ${previewPoints} điểm cho ${customer.fullName} (hóa đơn ${bill.toLocaleString('vi-VN')}đ)?`, 'Cộng điểm'))) return;
    setSubmitting(true);
    try {
      const tx = await apiRequest<PointTransaction>('/points/store-earn', {
        method: 'POST',
        body: { customerCode: customer.customerCode, billAmount: bill },
      });
      setLastTx(tx);
      setCustomer({ ...customer, zenPoints: tx.pointsAfter });
      setBillAmount('');
      toast.success(`Đã cộng ${tx.points} điểm cho ${customer.fullName}`);
    } catch (e: any) {
      toast.error(e?.message ?? 'Không tích được điểm');
    } finally {
      setSubmitting(false);
    }
  };

  const redeem = async () => {
    if (!customer) return;
    const pts = parseInt(redeemPoints, 10) || 0;
    if (pts <= 0) return toast.error('Nhập số điểm cần trừ');
    if (pts > customer.zenPoints) return toast.error('Khách không đủ điểm');
    if (!redeemReason.trim()) return toast.error('Nhập tên quà / lý do đổi điểm');
    if (!(await confirm('Đổi quà', `Trừ ${pts} điểm của ${customer.fullName} để đổi "${redeemReason.trim()}"?`, 'Trừ điểm', true))) return;
    setSubmitting(true);
    try {
      const tx = await apiRequest<PointTransaction>('/points/adjust', {
        method: 'POST',
        body: { userId: customer.id, points: -pts, type: 'REDEEMED_STORE', description: `Đổi quà: ${redeemReason.trim()}` },
      });
      setLastTx(tx);
      setCustomer({ ...customer, zenPoints: tx.pointsAfter });
      setRedeemPoints('');
      setRedeemReason('');
      toast.success(`Đã trừ ${pts} điểm của ${customer.fullName}`);
    } catch (e: any) {
      toast.error(e?.message ?? 'Không đổi được điểm');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView contentContainerClassName="px-5 pb-10 gap-4" keyboardShouldPersistTaps="handled">
        {!customer ? (
          <Card className="gap-4">
            <View>
              <Text className="font-bold text-sm uppercase tracking-wider text-foreground">📷 Quét QR tích điểm</Text>
              <Text className="text-[11px] text-muted-foreground mt-1">
                Khách mở mục “QR tích điểm” trong app, nhân viên quét mã để tích điểm hoặc đổi quà.
              </Text>
            </View>

            <View className="aspect-square w-full rounded-2xl overflow-hidden bg-neutral-900">
              {cameraOn ? (
                <>
                  <CameraView
                    style={{ flex: 1 }}
                    facing="back"
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    onBarcodeScanned={onScanned}
                  />
                  <View pointerEvents="none" className="absolute inset-[18%] border-4 border-white/80 rounded-2xl" />
                </>
              ) : (
                <View className="flex-1 items-center justify-center gap-3 p-6">
                  <Camera size={40} color="rgba(255,255,255,0.8)" />
                  <Text className="text-xs text-white/80 text-center">Bấm “Mở camera” để quét mã QR của khách</Text>
                </View>
              )}
            </View>

            <Button
              title={cameraOn ? 'Tắt camera' : 'Mở camera'}
              variant={cameraOn ? 'outline' : 'primary'}
              onPress={cameraOn ? () => setCameraOn(false) : openCamera}
              icon={cameraOn ? <CameraOff size={16} color={COLORS.foreground} /> : <Camera size={16} color="#fff" />}
            />

            <View className="gap-2">
              <View className="flex-row items-center gap-1.5">
                <Keyboard size={14} color={COLORS.muted} />
                <Text className="text-[11px] font-bold text-muted-foreground uppercase">Hoặc nhập mã khách hàng</Text>
              </View>
              <View className="flex-row gap-2">
                <TextInput
                  value={manualCode}
                  onChangeText={(t) => setManualCode(t.toUpperCase())}
                  placeholder="Z12345678"
                  placeholderTextColor="rgba(107,94,83,0.5)"
                  maxLength={9}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  onSubmitEditing={() => lookup(manualCode)}
                  className="flex-1 border border-border px-3 py-3 rounded-xl text-sm font-bold tracking-widest text-foreground bg-card"
                />
                <Pressable
                  onPress={() => lookup(manualCode)}
                  disabled={looking}
                  className={cn('px-4 rounded-xl bg-primary flex-row items-center gap-1.5', looking && 'opacity-50')}
                >
                  <Search size={16} color="#fff" />
                  <Text className="text-white font-bold text-sm">{looking ? '...' : 'Tìm'}</Text>
                </Pressable>
              </View>
            </View>
          </Card>
        ) : (
          <>
            {/* Thông tin khách */}
            <Card className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                <Text className="text-primary font-black text-lg">{customer.fullName[0]?.toUpperCase()}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-foreground" numberOfLines={1}>
                  {customer.fullName}
                </Text>
                <Text className="text-[11px] text-muted-foreground">
                  {customer.customerCode}
                  {customer.phone ? ` · ${customer.phone}` : ''}
                </Text>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Coins size={16} color={COLORS.accent} />
                  <Text className="text-sm font-black text-accent-strong">{customer.zenPoints} điểm</Text>
                </View>
              </View>
              <Pressable onPress={reset} className="border border-border px-3 py-2 rounded-xl flex-row items-center gap-1.5">
                <RotateCcw size={14} color={COLORS.primary} />
                <Text className="text-xs font-bold text-primary">Khách khác</Text>
              </Pressable>
            </Card>

            {lastTx && (
              <View className="bg-green-50 border border-green-200 rounded-xl p-3">
                <Text className="text-xs font-semibold text-green-800">
                  ✓ {lastTx.description}: {lastTx.points > 0 ? '+' : ''}
                  {lastTx.points} điểm (còn {lastTx.pointsAfter})
                </Text>
              </View>
            )}

            {/* Tích điểm theo hóa đơn */}
            <Card className="gap-3">
              <View className="flex-row items-center gap-1.5">
                <Coins size={16} color={COLORS.primary} />
                <Text className="text-xs font-black text-primary uppercase tracking-widest">Tích điểm hóa đơn tại quầy</Text>
              </View>
              <Text className="text-[11px] text-muted-foreground">Số tiền khách thanh toán (10.000đ = 1 điểm)</Text>
              <TextInput
                value={bill ? bill.toLocaleString('vi-VN') : ''}
                onChangeText={setBillAmount}
                keyboardType="number-pad"
                placeholder="Ví dụ: 75.000"
                placeholderTextColor="rgba(107,94,83,0.5)"
                className="border border-border px-3 py-3 rounded-xl text-sm font-bold text-foreground bg-card"
              />
              {bill > 0 && (
                <Text className="text-xs text-muted-foreground">
                  Khách được cộng <Text className="font-black text-primary">{previewPoints}</Text> điểm
                </Text>
              )}
              <Button title="Cộng điểm" onPress={earn} loading={submitting} disabled={bill < VND_PER_EARNED_POINT} />
            </Card>

            {/* Đổi quà bằng điểm */}
            <Card className="gap-3">
              <View className="flex-row items-center gap-1.5">
                <Gift size={16} color={COLORS.accentStrong} />
                <Text className="text-xs font-black text-accent-strong uppercase tracking-widest">Đổi quà bằng điểm</Text>
              </View>
              <TextInput
                value={redeemPoints}
                onChangeText={(t) => setRedeemPoints(t.replace(/\D/g, ''))}
                keyboardType="number-pad"
                placeholder={`Số điểm trừ (tối đa ${customer.zenPoints})`}
                placeholderTextColor="rgba(107,94,83,0.5)"
                className="border border-border px-3 py-3 rounded-xl text-sm font-bold text-foreground bg-card"
              />
              <TextInput
                value={redeemReason}
                onChangeText={setRedeemReason}
                placeholder="Tên quà, ví dụ: Ly trà sữa size M"
                placeholderTextColor="rgba(107,94,83,0.5)"
                maxLength={150}
                className="border border-border px-3 py-3 rounded-xl text-sm text-foreground bg-card"
              />
              <Button title="Trừ điểm đổi quà" variant="danger" onPress={redeem} loading={submitting} disabled={customer.zenPoints <= 0} />
            </Card>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
