import {
  polarToCartesian,
  describeArc,
  dbfsToSplEstimate,
  splToArcProgress,
  splToZone,
  smooth,
  MIN_DB,
  MAX_DB,
} from "./logic";

describe("polarToCartesian", () => {
  it("returns the rightmost point at angle 0", () => {
    const { x, y } = polarToCartesian(0, 0, 10, 0);
    expect(x).toBeCloseTo(10);
    expect(y).toBeCloseTo(0);
  });

  it("returns the bottom point at angle 90 (SVG y grows downward)", () => {
    const { x, y } = polarToCartesian(0, 0, 10, 90);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(10);
  });

  it("offsets from a non-zero center", () => {
    const { x, y } = polarToCartesian(5, 5, 10, 0);
    expect(x).toBeCloseTo(15);
    expect(y).toBeCloseTo(5);
  });
});

describe("describeArc", () => {
  it("starts at the start-angle point and ends at the end-angle point", () => {
    const start = polarToCartesian(0, 0, 10, 135);
    const end = polarToCartesian(0, 0, 10, 405);
    const d = describeArc(0, 0, 10, 135, 405);
    expect(d).toBe(`M ${start.x} ${start.y} A 10 10 0 1 1 ${end.x} ${end.y}`);
  });

  it("uses large-arc-flag=0 for a sweep of 90 degrees", () => {
    const d = describeArc(0, 0, 10, 0, 90);
    expect(d).toContain("A 10 10 0 0 1");
  });

  it("uses large-arc-flag=1 for a sweep greater than 180 degrees", () => {
    const d = describeArc(0, 0, 10, 135, 405);
    expect(d).toContain("A 10 10 0 1 1");
  });

  it("uses large-arc-flag=0 for a zero-degree sweep", () => {
    const d = describeArc(0, 0, 10, 135, 135);
    expect(d).toContain("A 10 10 0 0 1");
  });
});
