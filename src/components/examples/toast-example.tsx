"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ToastExample() {
  return (
    <>
      <Button variant="outline" onClick={() => toast("기본 토스트입니다.")}>
        기본
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.success("성공적으로 처리되었습니다.")}
      >
        성공
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.warning("주의가 필요합니다.")}
      >
        경고
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.error("오류가 발생했습니다.")}
      >
        에러
      </Button>
    </>
  );
}
