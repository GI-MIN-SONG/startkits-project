"use client";

import { LinkIcon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { buildQuoteShareUrl } from "@/lib/quotes/share-url";

type CopyLinkButtonProps = {
  quoteId: string;
  quoteTitle: string;
  // D-V1-04 확정: 승인 상태가 아닌 견적서는 복사를 막지 않되 경고를 표시한다.
  isPublished: boolean;
};

// @/lib/quotes(index.ts)를 import하지 않는다. index를 거치면 notion.ts/logger.ts/retry.ts 등
// server-only 모듈이 클라이언트 번들에 섞여 빌드가 깨진다(error.tsx와 동일한 이유).
export function CopyLinkButton({
  quoteId,
  quoteTitle,
  isPublished,
}: CopyLinkButtonProps) {
  async function handleClick() {
    const url = buildQuoteShareUrl(window.location.origin, quoteId);
    if (!url) {
      toast.error("공유 링크를 만들 수 없습니다.");
      return;
    }

    if (!navigator.clipboard) {
      toast.error("클립보드를 사용할 수 없는 환경입니다.", {
        description: url,
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("공유 링크를 복사했습니다.");
    } catch {
      toast.error("링크 복사에 실패했습니다.", { description: url });
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {!isPublished && (
        <Tooltip>
          <TooltipTrigger
            render={
              <span
                role="img"
                aria-label={`${quoteTitle} 견적서는 아직 승인되지 않아 복사한 링크를 열면 클라이언트에게 404로 표시됩니다.`}
                className="text-destructive"
              />
            }
          >
            <TriangleAlertIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>
            승인 전 견적서입니다. 복사한 링크는 클라이언트에게 404로 보입니다.
          </TooltipContent>
        </Tooltip>
      )}
      <Button
        variant="outline"
        size="sm"
        aria-label={`${quoteTitle} 견적서 공유 링크 복사`}
        onClick={handleClick}
      >
        <LinkIcon data-icon="inline-start" />
        링크 복사
      </Button>
    </div>
  );
}
