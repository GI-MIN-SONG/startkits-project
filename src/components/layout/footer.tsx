import { Container } from "@/components/layout/container";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>&copy; {year} 모든 권리 보유.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-foreground">
            이용약관
          </a>
          <a href="#" className="hover:text-foreground">
            개인정보처리방침
          </a>
        </div>
      </Container>
    </footer>
  );
}

export { Footer };
