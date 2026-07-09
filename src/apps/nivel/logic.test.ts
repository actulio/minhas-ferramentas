import { anglesFromAccelerometer, isLevel } from "./logic";

describe("anglesFromAccelerometer", () => {
  it("reports ~0 pitch and roll when flat (z=1)", () => {
    const { pitch, roll } = anglesFromAccelerometer(0, 0, 1);
    expect(Math.abs(pitch)).toBeLessThan(0.5);
    expect(Math.abs(roll)).toBeLessThan(0.5);
  });
  it("reports ~90 pitch when tilted on the y axis", () => {
    const { pitch } = anglesFromAccelerometer(0, 1, 0);
    expect(Math.round(pitch)).toBe(90);
  });
  it("reports ~90 roll when tilted on the x axis", () => {
    const { roll } = anglesFromAccelerometer(1, 0, 0);
    expect(Math.round(roll)).toBe(90);
  });
});

describe("isLevel", () => {
  it("is true within tolerance", () => {
    expect(isLevel(0.4, -0.3, 1)).toBe(true);
  });
  it("is false outside tolerance", () => {
    expect(isLevel(5, 0, 1)).toBe(false);
  });
});
