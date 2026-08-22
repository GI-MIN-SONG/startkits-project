"use client";

import { DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button
      type="button"
      size="lg"
      onClick={() => window.print()}
      className="print-hidden"
    >
      <DownloadIcon data-icon="inline-start" />
      PDF로 저장
    </Button>
  );
}
