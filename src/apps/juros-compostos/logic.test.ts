import {
  solveForA,
  solveForP,
  solveForR,
  solveForT,
  solveForN,
  monthsToYears,
} from "./logic";

describe("Juros Compostos - solveForA", () => {
  it("calculates final amount with monthly compounding", () => {
    // P=1000, r=0.12 (12%), n=12, t=1 year
    // A = 1000 * (1 + 0.12/12)^(12*1) = 1000 * 1.01^12 ≈ 1126.83
    const result = solveForA(1000, 0.12, 12, 1);
    expect(result).toBeCloseTo(1126.83, 2);
  });

  it("calculates final amount with annual compounding", () => {
    // P=5000, r=0.10 (10%), n=1, t=3 years
    // A = 5000 * (1 + 0.10/1)^(1*3) = 5000 * 1.1^3 = 6655.00
    const result = solveForA(5000, 0.1, 1, 3);
    expect(result).toBeCloseTo(6655.0, 2);
  });

  it("returns principal when rate is zero", () => {
    const result = solveForA(1000, 0, 12, 5);
    expect(result).toBe(1000);
  });

  it("returns principal when time is zero", () => {
    const result = solveForA(1000, 0.12, 12, 0);
    expect(result).toBe(1000);
  });
});

describe("Juros Compostos - solveForP", () => {
  it("calculates principal from known final amount", () => {
    // Reverse of solveForA: A=1126.83, r=0.12, n=12, t=1
    const result = solveForP(1126.83, 0.12, 12, 1);
    expect(result).toBeCloseTo(1000, 0);
  });

  it("returns A when rate is zero", () => {
    const result = solveForP(5000, 0, 12, 3);
    expect(result).toBe(5000);
  });
});

describe("Juros Compostos - solveForR", () => {
  it("calculates rate from known values", () => {
    // A=1126.83, P=1000, n=12, t=1 → r ≈ 0.12
    const result = solveForR(1126.83, 1000, 12, 1);
    expect(result).toBeCloseTo(0.12, 2);
  });

  it("returns 0 when A equals P", () => {
    const result = solveForR(1000, 1000, 12, 1);
    expect(result).toBeCloseTo(0, 4);
  });
});

describe("Juros Compostos - solveForT", () => {
  it("calculates time from known values", () => {
    // A=1126.83, P=1000, r=0.12, n=12 → t ≈ 1
    const result = solveForT(1126.83, 1000, 0.12, 12);
    expect(result).toBeCloseTo(1.0, 1);
  });

  it("returns 0 when A equals P", () => {
    const result = solveForT(1000, 1000, 0.12, 12);
    expect(result).toBeCloseTo(0, 4);
  });
});

describe("Juros Compostos - solveForN", () => {
  it("finds compounding frequency via numerical solver", () => {
    // A=1126.83, P=1000, r=0.12, t=1 → n ≈ 12
    const result = solveForN(1126.83, 1000, 0.12, 1);
    expect(result).toBeCloseTo(12, 0);
  });

  it("finds annual compounding", () => {
    // A=6655, P=5000, r=0.10, t=3 → n=1
    const result = solveForN(6655, 5000, 0.1, 3);
    expect(result).toBeCloseTo(1, 0);
  });
});

describe("monthsToYears", () => {
  it("converts 12 months to 1 year", () => {
    expect(monthsToYears(12)).toBe(1);
  });

  it("converts 30 months to 2.5 years", () => {
    expect(monthsToYears(30)).toBe(2.5);
  });

  it("converts 0 months to 0 years", () => {
    expect(monthsToYears(0)).toBe(0);
  });
});

describe("Edge cases", () => {
  it("solveForA with zero principal returns 0", () => {
    expect(solveForA(0, 0.12, 12, 1)).toBe(0);
  });
});
