import { Container } from "@/components/layout/container";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>&copy; {year} Invoice Web</p>
        <div className="flex items-center gap-4">
          <span>노션 견적서를 더 간편하게</span>
        </div>
      </Container>
    </footer>
  );
}

export { Footer };
