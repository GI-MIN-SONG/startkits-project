import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <Container className="py-24">
      <h1 className="text-3xl font-semibold tracking-tight">문의</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        아래 폼은 Input, Textarea, Label, Button 컴포넌트를 활용한 예시입니다.
      </p>
      <form className="mt-8 flex max-w-md flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">이름</Label>
          <Input id="name" name="name" placeholder="홍길동" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="message">메시지</Label>
          <Textarea
            id="message"
            name="message"
            placeholder="문의 내용을 입력하세요"
          />
        </div>
        <Button type="submit" className="self-start">
          보내기
        </Button>
      </form>
    </Container>
  );
}
