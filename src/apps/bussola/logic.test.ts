import { headingFromMagnetometer, cardinalPt } from "./logic";

describe("headingFromMagnetometer", () => {
  it("returns 0 for +x axis", () => {
    expect(Math.round(headingFromMagnetometer(1, 0))).toBe(0);
  });
  it("returns 90 for +y axis", () => {
    expect(Math.round(headingFromMagnetometer(0, 1))).toBe(90);
  });
  it("returns 180 for -x axis", () => {
    expect(Math.round(headingFromMagnetometer(-1, 0))).toBe(180);
  });
  it("returns 270 for -y axis", () => {
    expect(Math.round(headingFromMagnetometer(0, -1))).toBe(270);
  });
});

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
