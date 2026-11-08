import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';

// Gọi `load` khi mở màn hình và lặp lại mỗi `intervalMs` khi màn hình đang hiện & app đang mở.
// (App chưa dùng luồng sự kiện SSE như web — tải lại định kỳ là đủ cho trạng thái đơn.)
export function usePolling(load: () => void, intervalMs: number) {
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      loadRef.current();
      const timer = setInterval(() => {
        if (AppState.currentState === 'active') loadRef.current();
      }, intervalMs);
      const sub = AppState.addEventListener('change', (s) => s === 'active' && loadRef.current());
      return () => {
        clearInterval(timer);
        sub.remove();
      };
    }, [intervalMs]),
  );
}
