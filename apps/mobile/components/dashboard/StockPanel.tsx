import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { confirm } from '@/lib/confirm';
import { useProducts } from '@/lib/stores/products';
import { toast } from '@/lib/stores/toast';
import { LOW_STOCK, Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import ProductImage from '@/components/ProductImage';
import { COLORS } from '@/components/ui';
import MenuGroupManager from './MenuGroupManager';
import ProductFormDialog from './ProductFormDialog';

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

const UNGROUPED = 'Chưa phân danh mục';

// Ô nhập số lượng còn bán được. Bấm "Lưu" để đặt số mới (đặt lại, không cộng dồn).
function StockEditor({ product, busy, onSave }: { product: Product; busy: boolean; onSave: (stock: number) => void }) {
  // Số đang gõ dở; null = đang hiện số lượng hiện tại
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? String(product.stock);
  const value = parseInt(text, 10);
  const valid = Number.isInteger(value) && value >= 0 && value <= 100_000;
  const changed = valid && value !== product.stock;
  const tone =
    product.stock === 0 ? ['bg-destructive/10', 'text-destructive'] : product.stock <= LOW_STOCK ? ['bg-amber-100', 'text-amber-800'] : ['bg-primary/10', 'text-primary'];

  const save = (stock: number) => {
    setDraft(null);
    onSave(stock);
  };

  return (
    <View className="items-end gap-1.5 w-[124px]">
      <View className={cn('px-2 py-0.5 rounded-full', tone[0])}>
        <Text className={cn('text-[10px] font-bold', tone[1])}>
          {product.stock === 0 ? 'Hết hàng' : product.stock <= LOW_STOCK ? `Sắp hết · ${product.stock}` : `Còn ${product.stock}`}
        </Text>
      </View>
      <View className="flex-row items-center gap-1">
        <TextInput
          value={text}
          onChangeText={(t) => setDraft(t.replace(/\D/g, ''))}
          keyboardType="number-pad"
          editable={!busy}
          accessibilityLabel={`Số lượng ${product.name}`}
          className="w-16 text-center text-sm font-bold border border-border rounded-lg py-1.5 bg-card text-foreground"
        />
        <Pressable onPress={() => changed && save(value)} disabled={busy || !changed} className={cn('bg-primary px-2.5 py-2 rounded-lg', (busy || !changed) && 'opacity-40')}>
          <Text className="text-[10px] font-bold text-white">Lưu</Text>
        </Pressable>
      </View>
      {product.stock > 0 && (
        <Pressable onPress={() => save(0)} disabled={busy}>
          <Text className="text-[10px] font-semibold text-destructive underline">Báo hết hàng</Text>
        </Pressable>
      )}
    </View>
  );
}

type Tone = 'muted' | 'primary' | 'danger' | 'dangerOutline';
const TONE_BOX: Record<Tone, string> = { muted: 'bg-muted', primary: 'bg-primary/10', danger: 'bg-destructive/10', dangerOutline: 'border border-destructive/30' };
const TONE_TEXT: Record<Tone, string> = { muted: 'text-foreground', primary: 'text-primary', danger: 'text-destructive', dangerOutline: 'text-destructive' };

function SmallButton({ label, icon, onPress, tone = 'muted', disabled }: { label: string; icon: React.ReactNode; onPress: () => void; tone?: Tone; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} className={cn('flex-row items-center gap-1 px-2 py-1 rounded-md', TONE_BOX[tone])}>
      {icon}
      <Text className={cn('text-[10px] font-bold', TONE_TEXT[tone])}>{label}</Text>
    </Pressable>
  );
}

// Giống web: tab "Kho món" / "Món & kho" (components/dashboard/MenuManager.tsx)
// Nhân viên: chỉ sửa số lượng. Admin / Chủ quán: thêm / sửa / xóa món, ảnh, danh mục.
export default function StockPanel({ canEdit = false }: { canEdit?: boolean }) {
  const { products, groups, loading, fetch, setStock, createProduct, updateProduct, deleteProduct, uploadImage, removeImage } = useProducts();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const run = async (id: string, action: () => Promise<void>, msg: string) => {
    setBusyId(id);
    try {
      await action();
      toast.success(msg);
    } catch (e: any) {
      toast.error(e?.message ?? 'Thao tác thất bại');
    } finally {
      setBusyId(null);
    }
  };

  // Chọn ảnh vuông từ thư viện máy rồi tải lên (API chỉ nhận JPG / PNG / WEBP, tối đa 3MB)
  const pickImage = async (product: Product) => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (res.canceled || !res.assets[0]) return;
    const asset = res.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_IMAGE_BYTES) return toast.error('Ảnh tối đa 3MB — hãy chọn ảnh nhỏ hơn');
    const type = asset.mimeType && /jpe?g|png|webp/.test(asset.mimeType) ? asset.mimeType : 'image/jpeg';
    const ext = type.split('/')[1].replace('jpeg', 'jpg');
    run(product.id, () => uploadImage(product.id, { uri: asset.uri, name: asset.fileName ?? `${product.id}.${ext}`, type }), `Đã cập nhật ảnh cho "${product.name}"`);
  };

  const askRemoveImage = async (product: Product) => {
    if (await confirm('Xóa ảnh?', `Xóa ảnh của "${product.name}"?`, 'Xóa', true)) run(product.id, () => removeImage(product.id), 'Đã xóa ảnh');
  };

  const askDelete = async (product: Product) => {
    if (await confirm('Xóa món?', `Xóa hẳn "${product.name}" khỏi menu? Đơn cũ vẫn giữ tên và giá món.`, 'Xóa món', true)) {
      run(product.id, () => deleteProduct(product.id), `Đã xóa món "${product.name}"`);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [fetch]),
  );

  const save = async (product: Product, stock: number) => {
    setBusyId(product.id);
    try {
      await setStock(product.id, stock);
      toast.success(stock === 0 ? `"${product.name}" đã chuyển sang Hết hàng` : `"${product.name}": còn ${stock} phần`);
    } catch (e: any) {
      toast.error(e?.message ?? 'Không lưu được số lượng');
    } finally {
      setBusyId(null);
    }
  };

  // Xếp theo danh mục (thứ tự Admin đặt), món chưa có danh mục để cuối
  const ids = new Set(groups.map((g) => g.id));
  const sections = [
    ...groups.map((g) => ({ key: g.id, title: g.name, list: products.filter((p) => p.groupId === g.id) })),
    { key: 'none', title: UNGROUPED, list: products.filter((p) => !p.groupId || !ids.has(p.groupId)) },
  ].filter((s) => s.list.length > 0);

  return (
    <ScrollView
      contentContainerClassName="px-5 pb-10 gap-5"
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} tintColor={COLORS.primary} />}
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text className="text-[11px] text-muted-foreground flex-1">
          Nhập số phần còn làm được rồi bấm “Lưu”. Mỗi phần khách đặt tự trừ 1, đơn bị hủy được cộng lại; về 0 thì khách thấy “Tạm hết”.
          {canEdit ? ' Ảnh nên vuông, tối đa 3MB.' : ''}
        </Text>
        {canEdit && (
          <Pressable onPress={() => setCreating(true)} className="flex-row items-center gap-1 bg-primary px-3 py-2 rounded-lg">
            <Plus size={16} color="#fff" />
            <Text className="text-xs font-bold text-white">Thêm món</Text>
          </Pressable>
        )}
      </View>

      {canEdit && <MenuGroupManager />}
      {sections.map(({ key, title, list }) => (
        <View key={key} className="gap-2.5">
          <Text className="text-xs font-black text-muted-foreground uppercase tracking-wider">
            {title} · {list.length} món · {list.filter((p) => p.stock === 0).length} hết · {list.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK).length} sắp hết
          </Text>
          {list.map((product) => (
            <View
              key={product.id}
              className={cn(
                'flex-row items-center gap-3 p-2.5 rounded-xl border',
                product.isAvailable ? 'bg-neutral-50 border-border/70' : 'bg-destructive/5 border-destructive/20',
                busyId === product.id && 'opacity-60',
              )}
            >
              <ProductImage product={product} className="w-14 h-14 rounded-xl" emojiSize={28} dim={!product.isAvailable} />
              <View className="flex-1">
                <Text className="text-xs font-bold text-foreground leading-snug">{product.name}</Text>
                <Text className="text-[11px] text-muted-foreground">{product.price.toLocaleString('vi-VN')}₫</Text>
                {canEdit && (
                  <View className="flex-row flex-wrap gap-1.5 mt-1.5">
                    <SmallButton label="Sửa" icon={<Pencil size={12} color={COLORS.foreground} />} onPress={() => setEditing(product)} disabled={busyId === product.id} />
                    <SmallButton
                      label={product.imageUrl ? 'Đổi ảnh' : 'Thêm ảnh'}
                      tone="primary"
                      icon={<ImagePlus size={12} color={COLORS.primary} />}
                      onPress={() => pickImage(product)}
                      disabled={busyId === product.id}
                    />
                    {product.imageUrl ? (
                      <SmallButton
                        label="Xóa ảnh"
                        tone="danger"
                        icon={<Trash2 size={12} color={COLORS.destructive} />}
                        onPress={() => askRemoveImage(product)}
                        disabled={busyId === product.id}
                      />
                    ) : null}
                    <SmallButton
                      label="Xóa món"
                      tone="dangerOutline"
                      icon={<Trash2 size={12} color={COLORS.destructive} />}
                      onPress={() => askDelete(product)}
                      disabled={busyId === product.id}
                    />
                  </View>
                )}
              </View>
              <StockEditor key={`${product.id}-${product.stock}`} product={product} busy={busyId === product.id} onSave={(s) => save(product, s)} />
            </View>
          ))}
        </View>
      ))}
      {creating && (
        <ProductFormDialog
          onClose={() => setCreating(false)}
          onSubmit={async (data) => {
            const created = await createProduct(data);
            toast.success(`Đã thêm "${created.name}" — bấm "Thêm ảnh" để gắn ảnh cho món`);
          }}
        />
      )}
      {editing && (
        <ProductFormDialog
          product={editing}
          onClose={() => setEditing(null)}
          onSubmit={async (data) => {
            await updateProduct(editing.id, data);
            toast.success(`Đã lưu "${data.name}"`);
          }}
        />
      )}
    </ScrollView>
  );
}
