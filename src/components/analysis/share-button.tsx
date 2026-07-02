"use client";

import * as React from "react";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  shareId: string;
}

export function ShareButton({ shareId }: ShareButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const isLocal = shareId.startsWith("local-");

  async function handleShare() {
    const url = `${window.location.origin}/analysis/${shareId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard unavailable (http / permissions) — best effort fallback.
      window.prompt("Скопируйте ссылку:", url);
    }
  }

  if (isLocal) {
    return (
      <Button variant="secondary" disabled title="Результат не сохранён на сервере — ссылкой поделиться нельзя">
        <Share2 /> Ссылка недоступна
      </Button>
    );
  }

  return (
    <Button variant="secondary" onClick={handleShare}>
      {copied ? (
        <>
          <Check className="text-emerald-400" /> Скопировано
        </>
      ) : (
        <>
          <Share2 /> Поделиться
        </>
      )}
    </Button>
  );
}
