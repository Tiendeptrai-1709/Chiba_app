import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS, SHADOW } from './ui';

// Hộp thoại giữa màn hình (form thêm món, đổi điểm...) — giống các modal của web
export default function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View style={[SHADOW.modal, { width: '100%', maxWidth: 448, maxHeight: '90%' }]} className="bg-card border border-border rounded-2xl">
            <View className="flex-row items-center justify-between px-6 pt-5 pb-2">
              <Text className="text-sm font-black uppercase tracking-wider text-foreground flex-1">{title}</Text>
              <Pressable onPress={onClose} accessibilityLabel="Đóng" className="p-1.5 rounded-lg">
                <X size={16} color={COLORS.muted} />
              </Pressable>
            </View>
            <ScrollView contentContainerClassName="px-6 pb-6 pt-2 gap-4" keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function DialogActions({ children }: { children: React.ReactNode }) {
  return <View className="flex-row justify-end gap-2 pt-2">{children}</View>;
}
