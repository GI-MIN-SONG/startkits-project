import { describe, expect, it } from "vitest";

import { isPublishable } from "../status";

describe("isPublishable", () => {
  it.each(["대기", "거절", "", "발행됨"])(
    "%s는 공개 대상이 아니다",
    (status) => {
      expect(isPublishable(status)).toBe(false);
    }
  );

  it("승인만 공개 대상이다", () => {
    expect(isPublishable("승인")).toBe(true);
  });
});
