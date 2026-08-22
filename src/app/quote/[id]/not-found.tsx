import { FileQuestionIcon } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function QuoteNotFound() {
  return (
    <section className="flex min-h-[65vh] flex-col items-center justify-center px-6 text-center">
      <FileQuestionIcon
        className="mb-5 size-12 text-muted-foreground"
        aria-hidden="true"
      />
      <h1 className="text-2xl font-semibold">견적서를 찾을 수 없습니다</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        링크가 잘못되었거나 견적서가 비공개로 전환되었을 수 있습니다.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-7" })}>
        홈으로 돌아가기
      </Link>
    </section>
  );
}
