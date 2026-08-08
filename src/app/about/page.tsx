import { Container } from "@/components/layout/container";

export default function AboutPage() {
  return (
    <Container className="py-24">
      <h1 className="text-3xl font-semibold tracking-tight">소개</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        이 페이지는 스타터킷에 포함된 소개 페이지 예시입니다. 프로젝트 목적, 팀
        정보 등 원하는 내용으로 자유롭게 채워보세요.
      </p>
    </Container>
  );
}
