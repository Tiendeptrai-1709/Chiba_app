import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ChevronDown, ChevronUp, FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { confirm } from '@/lib/confirm';
import { useProducts } from '@/lib/stores/products';
import { toast } from '@/lib/stores/toast';
import { MenuGroup } from '@/lib/types';
import { cn } from '@/lib/utils';
import { COLORS } from '@/components/ui';

// Giống web: components/dashboard/MenuGroupManager.tsx — Admin thêm / đổi tên / sắp xếp / xóa danh mục
export default function MenuGroupManager() {
  const { groups, products, createGroup, renameGroup, deleteGroup, moveGroup } = useProducts();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [busy, setBusy] = useState(false);

  const countOf = (id: string) => products.filter((p) => p.groupId === id).length;

  const run = async (action: () => Promise<void>, msg?: string) => {
    setBusy(true);
    try {
      await action();
      if (msg) toast.success(msg);
    } catch (e: any) {
      toast.error(e?.message ?? 'Thao tác thất bại');
    } finally {
      setBusy(false);
    }
  };

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    run(async () => {
      await createGroup(name);
      setNewName('');
    }, `Đã thêm danh mục "${name}"`);
  };

  const saveRename = (g: MenuGroup) => {
    const name = editName.trim();
    if (!name || name === g.name) return setEditingId(null);
    run(async () => {
      await renameGroup(g.id, name);
      setEditingId(null);
    }, `Đã đổi tên thành "${name}"`);
  };

  const remove = async (g: MenuGroup) => {
    const n = countOf(g.id);
    const note = n > 0 ? ` ${n} món trong danh mục sẽ chuyển về "Chưa phân danh mục".` : '';
    if (!(await confirm('Xóa danh mục?', `Xóa danh mục "${g.name}"?${note}`, 'Xóa', true))) return;
    run(() => deleteGroup(g.id), `Đã xóa danh mục "${g.name}"`);
  };

  return (
    <View className="border border-border rounded-xl bg-neutral-50">
      <Pressable onPress={() => setOpen((v) => !v)} className="flex-row items-center justify-between px-3.5 py-3">
        <View className="flex-row items-center gap-2">
          <FolderOpen size={16} color={COLORS.primary} />
          <Text className="text-xs font-black uppercase tracking-wider text-foreground">Danh mục ({groups.length})</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="text-[11px] font-semibold text-muted-foreground">{open ? 'Thu gọn' : 'Thêm / sửa'}</Text>
          {open ? <ChevronUp size={16} color={COLORS.muted} /> : <ChevronDown size={16} color={COLORS.muted} />}
        </View>
      </Pressable>

      {open && (
        <View className="px-3.5 pb-3.5 gap-2">
          <Text className="text-[11px] text-muted-foreground">
            Danh mục dùng để khách lọc menu và để xem thống kê theo nhóm. Thứ tự ở đây cũng là thứ tự hiển thị cho khách.
          </Text>
          <View className="bg-card rounded-lg border border-border/70">
            {groups.map((g, i) => (
              <View key={g.id} className={cn('flex-row items-center gap-2 px-2.5 py-2', i > 0 && 'border-t border-border/70')}>
                <View>
                  <Pressable onPress={() => run(() => moveGroup(g.id, -1))} disabled={busy || i === 0} className={cn('p-0.5', i === 0 && 'opacity-25')}>
                    <ChevronUp size={14} color={COLORS.muted} />
                  </Pressable>
                  <Pressable
                    onPress={() => run(() => moveGroup(g.id, 1))}
                    disabled={busy || i === groups.length - 1}
                    className={cn('p-0.5', i === groups.length - 1 && 'opacity-25')}
                  >
                    <ChevronDown size={14} color={COLORS.muted} />
                  </Pressable>
                </View>
                {editingId === g.id ? (
                  <View className="flex-1 flex-row gap-1.5">
                    <TextInput
                      value={editName}
                      onChangeText={setEditName}
                      maxLength={50}
                      autoFocus
                      onSubmitEditing={() => saveRename(g)}
                      className="flex-1 border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground"
                    />
                    <Pressable onPress={() => saveRename(g)} disabled={busy} className="bg-primary px-2.5 rounded-lg justify-center">
                      <Text className="text-[10px] font-bold text-white">Lưu</Text>
                    </Pressable>
                    <Pressable onPress={() => setEditingId(null)} className="border border-border px-2 rounded-lg justify-center">
                      <Text className="text-[10px] font-bold text-foreground">Hủy</Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-foreground" numberOfLines={1}>
                        {g.name}
                      </Text>
                      <Text className="text-[10px] text-muted-foreground">{countOf(g.id)} món</Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        setEditingId(g.id);
                        setEditName(g.name);
                      }}
                      disabled={busy}
                      accessibilityLabel={`Đổi tên "${g.name}"`}
                      className="p-1.5 rounded-md bg-muted"
                    >
                      <Pencil size={14} color={COLORS.foreground} />
                    </Pressable>
                    <Pressable onPress={() => remove(g)} disabled={busy} accessibilityLabel={`Xóa "${g.name}"`} className="p-1.5 rounded-md bg-destructive/10">
                      <Trash2 size={14} color={COLORS.destructive} />
                    </Pressable>
                  </>
                )}
              </View>
            ))}
            {groups.length === 0 && <Text className="px-3 py-4 text-center text-xs text-muted-foreground">Chưa có danh mục nào</Text>}
          </View>
          <View className="flex-row gap-2">
            <TextInput
              value={newName}
              onChangeText={setNewName}
              maxLength={50}
              placeholder="Tên danh mục mới, ví dụ: Sữa chua"
              placeholderTextColor="rgba(107,94,83,0.5)"
              onSubmitEditing={add}
              className="flex-1 border border-border rounded-xl px-3 py-2.5 text-xs font-semibold bg-card text-foreground"
            />
            <Pressable onPress={add} disabled={busy || !newName.trim()} className={cn('flex-row items-center gap-1 bg-primary px-3.5 rounded-xl', (busy || !newName.trim()) && 'opacity-40')}>
              <Plus size={16} color="#fff" />
              <Text className="text-xs font-bold text-white">Thêm</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
