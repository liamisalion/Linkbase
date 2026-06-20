"use client";

import { useEffect, useState } from "react";

let showToastFn: ((msg: string) => void) | null = null;

export function toast(msg: string) {
  showToastFn?.(msg);
}

export function ToastProvider() {
  const [msg, setMsg] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    showToastFn = (m: string) => {
      setMsg(m);
      setVisible(true);
      setTimeout(() => setVisible(false), 2500);
    };
    return () => { showToastFn = null; };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 right-7 bg-green-600 text-white px-5 py-3 rounded-lg font-semibold text-sm shadow-xl z-[300] animate-in fade-in slide-in-from-bottom-3">
      ✓ {msg}
    </div>
  );
}
