import path from "node:path";

import { defineConfig } from "vitest/config";

// Next.js가 번들러 레벨에서 특별 처리하는 "server-only" 마커 패키지는
// 실제로 node_modules에 설치되지 않는다. Vitest는 이 번들 전용 처리를
// 대신할 수 없으므로 빈 모듈로 별칭 처리한다(공식 권장 테스트 설정 패턴).
export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "server-only": path.resolve(import.meta.dirname, "test/empty-module.ts"),
    },
  },
});
