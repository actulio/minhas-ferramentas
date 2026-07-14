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

describe("dbfsToSplEstimate", () => {
  it("maps silence-level dBFS to the low end of the SPL range", () => {
    expect(dbfsToSplEstimate(-160)).toBe(MIN_DB);
  });

  it("maps 0 dBFS (loudest possible input) using the fixed offset", () => {
    // 0 dBFS + the 90dB offset = 90. MAX_DB (120) is a safety ceiling for
    // clamping outliers, not something 0 dBFS reaches on its own.
    expect(dbfsToSplEstimate(0)).toBe(90);
  });

  it("applies the fixed offset for a mid-range value", () => {
    expect(dbfsToSplEstimate(-40)).toBe(50);
  });
});

describe("splToArcProgress", () => {
  it("is 0 at the minimum dB", () => {
    expect(splToArcProgress(MIN_DB)).toBe(0);
  });

  it("is 1 at the maximum dB", () => {
    expect(splToArcProgress(MAX_DB)).toBe(1);
  });

  it("is 0.5 at the midpoint", () => {
    expect(splToArcProgress((MIN_DB + MAX_DB) / 2)).toBeCloseTo(0.5);
  });

  it("clamps values above the maximum", () => {
    expect(splToArcProgress(MAX_DB + 50)).toBe(1);
  });
});

describe("splToZone", () => {
  it("is calmo below 60dB", () => {
    expect(splToZone(45)).toBe("calmo");
  });

  it("is moderado between 60 and 85dB", () => {
    expect(splToZone(70)).toBe("moderado");
  });

  it("is alto at 85dB and above", () => {
    expect(splToZone(90)).toBe("alto");
  });
});

describe("smooth", () => {
  it("moves partway from prev toward next", () => {
    expect(smooth(0, 10, 0.5)).toBe(5);
  });

  it("stays put when prev equals next", () => {
    expect(smooth(10, 10, 0.3)).toBe(10);
  });
});
