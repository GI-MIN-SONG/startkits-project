import { BadgeCheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <section className="flex flex-col items-center gap-10 px-4 py-24 text-center sm:px-6 lg:px-8">
      <Badge variant="secondary">
        <BadgeCheckIcon className="size-3.5" />
        모던 웹 스타터킷
      </Badge>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Next.js와 shadcn/ui로 시작하는 프로젝트
      </h1>
      <p className="max-w-xl text-muted-foreground">
        레이아웃, 다크모드, 재사용 가능한 UI 컴포넌트가 준비되어 있습니다.
      </p>
      <div className="flex gap-3">
        <Button>시작하기</Button>
        <Button variant="outline">문서 보기</Button>
      </div>
      <Card className="w-full max-w-md text-left">
        <CardHeader>
          <CardTitle>바로 사용 가능한 컴포넌트</CardTitle>
          <CardDescription>
            src/components/ui 아래 원자 컴포넌트를 조합해 새 화면을 빠르게 만들
            수 있습니다.
          </CardDescription>
        </CardHeader>
      </Card>
    </section>
  );
}
