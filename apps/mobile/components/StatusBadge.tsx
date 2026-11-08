import React from 'react';
import { Text, View } from 'react-native';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, OrderStatus } from '@/lib/types';

export default function StatusBadge({ status, small }: { status: OrderStatus; small?: boolean }) {
  const [bg, fg] = ORDER_STATUS_COLORS[status];
  return (
    <View style={{ backgroundColor: bg }} className={`rounded-full self-start ${small ? 'px-2 py-0.5' : 'px-3 py-1'}`}>
      <Text style={{ color: fg }} className={`font-bold ${small ? 'text-[10px]' : 'text-xs'}`}>
        {ORDER_STATUS_LABELS[status]}
      </Text>
    </View>
  );
}
