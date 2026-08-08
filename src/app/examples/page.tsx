import { InfoIcon } from "lucide-react";

import { ToastExample } from "@/components/examples/toast-example";
import { Container } from "@/components/layout/container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function ExampleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

export default function ExamplesPage() {
  return (
    <Container className="flex flex-col gap-10 py-24">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">예제</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          스타터킷에 설치된 shadcn/ui 컴포넌트를 한눈에 확인할 수 있는
          페이지입니다.
        </p>
      </div>

      <ExampleSection title="Button">
        <Button>기본</Button>
        <Button variant="outline">아웃라인</Button>
        <Button variant="secondary">세컨더리</Button>
        <Button variant="ghost">고스트</Button>
        <Button variant="destructive">삭제</Button>
        <Button variant="link">링크</Button>
      </ExampleSection>

      <Separator />

      <ExampleSection title="Badge">
        <Badge>기본</Badge>
        <Badge variant="secondary">세컨더리</Badge>
        <Badge variant="outline">아웃라인</Badge>
        <Badge variant="destructive">경고</Badge>
      </ExampleSection>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Form</h2>
        <div className="flex max-w-sm flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="example-name">이름</Label>
            <Input id="example-name" placeholder="홍길동" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="example-message">메시지</Label>
            <Textarea id="example-message" placeholder="내용을 입력하세요" />
          </div>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Card</h2>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>카드 제목</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Card, CardHeader, CardTitle, CardContent를 조합한 기본 카드입니다.
          </CardContent>
        </Card>
      </section>

      <Separator />

      <ExampleSection title="Avatar">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="아바타" />
          <AvatarFallback>SN</AvatarFallback>
        </Avatar>
        <Avatar size="sm">
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>LG</AvatarFallback>
        </Avatar>
      </ExampleSection>

      <Separator />

      <ExampleSection title="Skeleton">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="size-10 rounded-full" />
      </ExampleSection>

      <Separator />

      <ExampleSection title="Dialog">
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>
            다이얼로그 열기
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>다이얼로그 제목</DialogTitle>
              <DialogDescription>Dialog 컴포넌트 예시입니다.</DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton />
          </DialogContent>
        </Dialog>
      </ExampleSection>

      <Separator />

      <ExampleSection title="DropdownMenu">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            메뉴 열기
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>수정</DropdownMenuItem>
            <DropdownMenuItem>복제</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">삭제</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ExampleSection>

      <Separator />

      <ExampleSection title="Popover">
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>
            팝오버 열기
          </PopoverTrigger>
          <PopoverContent>Popover 컴포넌트 예시 내용입니다.</PopoverContent>
        </Popover>
      </ExampleSection>

      <Separator />

      <ExampleSection title="Tooltip">
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" size="icon" />}>
            <InfoIcon />
          </TooltipTrigger>
          <TooltipContent>도움말 텍스트</TooltipContent>
        </Tooltip>
      </ExampleSection>

      <Separator />

      <ExampleSection title="Sheet">
        <Sheet>
          <SheetTrigger render={<Button variant="outline" />}>
            시트 열기
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>시트 제목</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </ExampleSection>

      <Separator />

      <ExampleSection title="Toast">
        <ToastExample />
      </ExampleSection>
    </Container>
  );
}
