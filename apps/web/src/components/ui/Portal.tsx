'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Đưa popup/toast ra thẳng <body> để `position: fixed` luôn bám theo màn hình,
// không bị ảnh hưởng bởi transform/animation của các khối cha.
export default function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}
