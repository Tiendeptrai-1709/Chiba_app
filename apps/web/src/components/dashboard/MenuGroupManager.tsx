'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { useProductStore } from '@/lib/stores/useProductStore';
import { useNotificationStore } from '@/lib/stores/useNotificationStore';
import { MenuGroup } from '@/types';

// Admin thêm / đổi tên / sắp xếp / xóa danh mục (Cà phê, Trà sữa, Bánh...)
export default function MenuGroupManager() {
  const { groups, products, createGroup, renameGroup, deleteGroup, moveGroup } = useProductStore();
  const { showError, showSuccess } = useNotificationStore();
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
      if (msg) showSuccess(msg);
    } catch (e: any) {
      showError(e?.message ?? 'Thao tác thất bại');
    } finally {
      setBusy(false);
    }
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    run(async () => {
      await createGroup(name);
      setNewName('');
    }, `Đã thêm danh mục "${name}"`);
  };

  const saveRename = (group: MenuGroup) => {
    const name = editName.trim();
    if (!name || name === group.name) return setEditingId(null);
    run(async () => {
      await renameGroup(group.id, name);
      setEditingId(null);
    }, `Đã đổi tên thành "${name}"`);
  };

  const remove = (group: MenuGroup) => {
    const n = countOf(group.id);
    const note = n > 0 ? ` ${n} món trong danh mục sẽ chuyển về "Chưa phân danh mục".` : '';
    if (!window.confirm(`Xóa danh mục "${group.name}"?${note}`)) return;
    run(() => deleteGroup(group.id), `Đã xóa danh mục "${group.name}"`);
  };

  return (
    <section className="border border-border rounded-xl bg-neutral-50/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-foreground">
          <FolderOpen className="w-4 h-4 text-primary" /> Danh mục ({groups.length})
        </span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
          {open ? 'Thu gọn' : 'Thêm / sửa'}
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 space-y-2">
          <p className="text-[11px] text-muted-foreground">
            Danh mục dùng để khách lọc menu và để xem thống kê bán hàng theo nhóm. Thứ tự ở đây cũng là thứ tự hiển thị cho khách.
          </p>
          <ul className="divide-y divide-border/70 bg-card rounded-lg border border-border/70">
            {groups.map((group, i) => (
              <li key={group.id} className="flex items-center gap-2 px-2.5 py-2">
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => run(() => moveGroup(group.id, -1))}
                    disabled={busy || i === 0}
                    aria-label={`Đưa "${group.name}" lên`}
                    className="p-0.5 rounded text-muted-foreground hover:bg-muted disabled:opacity-25"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => run(() => moveGroup(group.id, 1))}
                    disabled={busy || i === groups.length - 1}
                    aria-label={`Đưa "${group.name}" xuống`}
                    className="p-0.5 rounded text-muted-foreground hover:bg-muted disabled:opacity-25"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {editingId === group.id ? (
                  <form
                    className="flex-1 flex gap-1.5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveRename(group);
                    }}
                  >
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={50}
                      autoFocus
                      aria-label="Tên danh mục mới"
                      className="flex-1 min-w-0 border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button type="submit" disabled={busy} className="text-[10px] font-bold text-white bg-primary px-2.5 rounded-lg">
                      Lưu
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="text-[10px] font-bold px-2 rounded-lg border border-border">
                      Hủy
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{group.name}</p>
                      <p className="text-[10px] text-muted-foreground">{countOf(group.id)} món</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(group.id);
                        setEditName(group.name);
                      }}
                      disabled={busy}
                      aria-label={`Đổi tên "${group.name}"`}
                      className="p-1.5 rounded-md text-foreground bg-muted"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(group)}
                      disabled={busy}
                      aria-label={`Xóa "${group.name}"`}
                      className="p-1.5 rounded-md text-destructive bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </li>
            ))}
            {groups.length === 0 && <li className="px-3 py-4 text-center text-xs text-muted-foreground">Chưa có danh mục nào</li>}
          </ul>

          <form onSubmit={add} className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={50}
              placeholder="Tên danh mục mới, ví dụ: Sữa chua"
              aria-label="Tên danh mục mới"
              className="flex-1 min-w-0 border border-border rounded-xl px-3 py-2.5 text-xs font-semibold bg-card focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={busy || !newName.trim()}
              className="flex items-center gap-1 text-xs font-bold text-white bg-primary px-3.5 rounded-xl disabled:opacity-40"
            >
              <Plus className="w-4 h-4" /> Thêm
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
