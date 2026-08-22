import {
  ArrowRightIcon,
  FileCheck2Icon,
  NotepadTextIcon,
  PrinterIcon,
} from "lucide-react";
import Link from "next/link";

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
    <>
      <section className="mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center sm:py-32">
        <Badge variant="secondary">
          <FileCheck2Icon className="size-3.5" />
          Notion-powered quotes
        </Badge>
        <h1 className="mt-7 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          견적서는 노션에서 작성하고,
          <br className="hidden sm:block" /> 링크 하나로 공유하세요.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          클라이언트는 로그인이나 별도 프로그램 없이 견적 내용을 확인하고 PDF로
          저장할 수 있습니다.
        </p>
        <Button size="lg" className="mt-9" render={<Link href="/quote/demo" />}>
          샘플 견적서 보기
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </section>
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto grid max-w-5xl gap-5 px-4 py-16 md:grid-cols-3">
          {[
            [
              NotepadTextIcon,
              "노션에서 관리",
              "익숙한 노션에서 견적 내용을 작성하고 수정합니다.",
            ],
            [
              ArrowRightIcon,
              "링크로 바로 공유",
              "파일을 다시 만들 필요 없이 웹 링크 하나만 전달합니다.",
            ],
            [
              PrinterIcon,
              "깔끔한 PDF 저장",
              "브라우저 인쇄 기능으로 언제든 PDF를 저장합니다.",
            ],
          ].map(([Icon, title, description]) => (
            <Card key={String(title)}>
              <CardHeader>
                <Icon className="mb-3 size-6" />
                <CardTitle>{String(title)}</CardTitle>
                <CardDescription className="leading-6">
                  {String(description)}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
