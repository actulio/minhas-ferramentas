import { cardinalPt, smoothAngle } from "./logic";

describe("cardinalPt", () => {
  it("maps cardinal degrees to pt-BR labels", () => {
    expect(cardinalPt(0)).toBe("N");
    expect(cardinalPt(45)).toBe("NE");
    expect(cardinalPt(90)).toBe("L");
    expect(cardinalPt(180)).toBe("S");
    expect(cardinalPt(270)).toBe("O");
  });
  it("wraps around near 360", () => {
    expect(cardinalPt(359)).toBe("N");
  });
});

describe("smoothAngle", () => {
  it("moves partway from prev toward next", () => {
    expect(smoothAngle(0, 90, 0.5)).toBe(45);
  });
  it("takes the short way forward across the 0/360 seam (350 -> 10)", () => {
    // shortest path is +20°, half of that from 350 lands on 0, not on ~180
    expect(smoothAngle(350, 10, 0.5)).toBe(0);
  });
  it("takes the short way backward across the seam (10 -> 350)", () => {
    expect(smoothAngle(10, 350, 0.5)).toBe(0);
  });
  it("keeps the result within [0,360)", () => {
    const r = smoothAngle(359, 5, 0.9);
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThan(360);
  });
});
