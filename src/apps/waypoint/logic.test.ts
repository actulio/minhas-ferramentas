import {
  haversineDistance,
  bearing,
  arrowRotation,
  formatDistance,
  smoothAngle,
  type Coord,
} from "./logic";

const origin: Coord = { latitude: 0, longitude: 0 };

describe("haversineDistance", () => {
  it("is 0 for the same point", () => {
    expect(haversineDistance(origin, origin)).toBe(0);
  });
  it("computes ~111km for 1 degree of latitude", () => {
    const d = haversineDistance(origin, { latitude: 1, longitude: 0 });
    expect(d).toBeGreaterThan(110000);
    expect(d).toBeLessThan(112000);
  });
});

describe("bearing", () => {
  it("points north (0deg) for a point due north", () => {
    expect(Math.round(bearing(origin, { latitude: 1, longitude: 0 }))).toBe(0);
  });
  it("points east (90deg) for a point due east", () => {
    expect(Math.round(bearing(origin, { latitude: 0, longitude: 1 }))).toBe(90);
  });
});

describe("arrowRotation", () => {
  it("subtracts heading from the target bearing", () => {
    expect(arrowRotation(90, 45)).toBe(45);
  });
  it("wraps into [0,360)", () => {
    expect(arrowRotation(0, 90)).toBe(270);
  });
});

describe("formatDistance", () => {
  it("uses metres below 1km", () => {
    expect(formatDistance(500)).toBe("500 m");
  });
  it("uses km with one decimal above 1km", () => {
    expect(formatDistance(1300)).toBe("1,3 km");
  });
});

describe("smoothAngle", () => {
  it("moves partway from prev toward next", () => {
    expect(smoothAngle(0, 90, 0.5)).toBe(45);
  });
  it("takes the short way across the 0/360 seam", () => {
    expect(smoothAngle(350, 10, 0.5)).toBe(0);
  });
  it("keeps the result within [0,360)", () => {
    const r = smoothAngle(359, 5, 0.9);
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThan(360);
  });
});
