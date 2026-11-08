import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ProductInput, useProducts } from '@/lib/stores/products';
import { CATEGORY_LABELS, Product, ProductCategory } from '@/lib/types';
import { cn } from '@/lib/utils';
import Dialog, { DialogActions } from '@/components/Dialog';
import { Button } from '@/components/ui';

const CATEGORIES: ProductCategory[] = ['MON_NUOC', 'BANH', 'TOPPING'];
const INPUT = 'w-full border border-border px-3 py-3 rounded-xl text-sm text-foreground bg-card';

function Label({ children }: { children: string }) {
  return <Text className="text-[11px] font-bold text-muted-foreground uppercase">{children}</Text>;
}

// Giống web: components/dashboard/ProductFormModal.tsx — thêm / sửa món (ảnh thêm ở danh sách sau khi tạo)
export default function ProductFormDialog({
  product,
  onClose,
  onSubmit,
}: {
  product?: Product;
  onClose: () => void;
  onSubmit: (data: ProductInput) => Promise<void>;
}) {
  const groups = useProducts((s) => s.groups);
  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [category, setCategory] = useState<ProductCategory>(product?.category ?? 'MON_NUOC');
  const [groupId, setGroupId] = useState<string>(product?.groupId ?? '');
  const [stock, setStock] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const priceValue = parseInt(price.replace(/\D/g, ''), 10);
  const stockValue = stock.trim() === '' ? 0 : parseInt(stock, 10);

  const submit = async () => {
    if (!name.trim()) return setError('Vui lòng nhập tên món');
    if (!Number.isFinite(priceValue)) return setError('Vui lòng nhập giá');
    if (!product && (!Number.isInteger(stockValue) || stockValue < 0)) return setError('Số lượng phải là số không âm');
    setSaving(true);
    setError(null);
    try {
      const data: ProductInput = { name: name.trim(), price: priceValue, category, groupId: groupId || null };
      await onSubmit(product ? data : { ...data, stock: stockValue });
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Không lưu được món');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog title={product ? '✏️ Sửa món' : '➕ Thêm món mới'} onClose={onClose}>
      <View className="gap-1">
        <Label>Tên món</Label>
        <TextInput value={name} onChangeText={setName} maxLength={100} placeholder="Ví dụ: Trà Đào Cam Sả" placeholderTextColor="rgba(107,94,83,0.5)" className={INPUT} />
      </View>
      <View className="gap-1">
        <Label>Giá (đồng)</Label>
        <TextInput
          value={Number.isFinite(priceValue) ? priceValue.toLocaleString('vi-VN') : ''}
          onChangeText={setPrice}
          keyboardType="number-pad"
          placeholder="Ví dụ: 45.000"
          placeholderTextColor="rgba(107,94,83,0.5)"
          className={cn(INPUT, 'font-bold')}
        />
      </View>
      {!product && (
        <View className="gap-1">
          <Label>Số lượng ban đầu</Label>
          <TextInput
            value={stock}
            onChangeText={(t) => setStock(t.replace(/\D/g, ''))}
            keyboardType="number-pad"
            placeholder="Để trống = 0 (Hết hàng)"
            placeholderTextColor="rgba(107,94,83,0.5)"
            className={cn(INPUT, 'font-bold')}
          />
        </View>
      )}
      <View className="gap-1.5">
        <Label>Danh mục</Label>
        <View className="flex-row flex-wrap gap-2">
          {[{ id: '', name: '— Chưa phân danh mục —' }, ...groups].map((g) => (
            <Pressable
              key={g.id || 'none'}
              onPress={() => setGroupId(g.id)}
              className={cn('px-3 py-2 rounded-full border', groupId === g.id ? 'bg-primary border-primary' : 'bg-card border-border')}
            >
              <Text className={cn('text-xs font-semibold', groupId === g.id ? 'text-white' : 'text-foreground')}>{g.name}</Text>
            </Pressable>
          ))}
        </View>
        <Text className="text-[11px] text-muted-foreground">Dùng để lọc menu và thống kê (Cà phê, Trà sữa, Bánh…).</Text>
      </View>
      <View className="gap-1.5">
        <Label>Loại món</Label>
        <View className="flex-row gap-2">
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              className={cn('flex-1 py-2.5 rounded-xl border items-center', category === c ? 'bg-primary border-primary' : 'bg-card border-border')}
            >
              <Text className={cn('text-xs font-bold', category === c ? 'text-white' : 'text-foreground')}>{CATEGORY_LABELS[c]}</Text>
            </Pressable>
          ))}
        </View>
        {category === 'MON_NUOC' && <Text className="text-[11px] text-muted-foreground">Đồ uống sẽ có lựa chọn độ ngọt, đá và topping khi đặt.</Text>}
      </View>
      {error && <Text className="text-xs font-semibold text-destructive">{error}</Text>}
      <DialogActions>
        <Button title="Hủy" variant="outline" onPress={onClose} className="min-h-0 py-2.5 px-4" textClassName="text-xs" />
        <Button
          title={saving ? 'Đang lưu...' : product ? 'Lưu thay đổi' : 'Thêm món'}
          onPress={submit}
          loading={saving}
          className="min-h-0 py-2.5 px-5"
          textClassName="text-xs"
        />
      </DialogActions>
    </Dialog>
  );
}
