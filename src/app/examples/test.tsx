import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/layout/container";

export default function TestExamplePage() {
  return (
    <Container className="flex flex-col gap-6 py-24">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">테스트 예제</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          테스트 커밋을 위한 간단한 예제 페이지입니다.
        </p>
      </div>

      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>테스트 카드</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge>기본</Badge>
            <Badge variant="secondary">세컨더리</Badge>
            <Badge variant="outline">아웃라인</Badge>
          </div>
          <Button variant="outline">테스트 버튼</Button>
        </CardContent>
      </Card>
    </Container>
  );
}
