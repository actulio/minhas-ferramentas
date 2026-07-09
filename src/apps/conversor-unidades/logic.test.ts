import {
  convertMlToOz,
  convertOzToMl,
  convertFtToM,
  convertMToFt,
  convertInToCm,
  convertCmToIn,
  parseOunceInput,
  TIME_FACTORS,
  convertTime,
  type TimeUnit,
} from "./logic";

describe("Conversor de Unidades - Lógica", () => {
  describe("Volume (ml <-> oz)", () => {
    it("converte ml para oz corretamente", () => {
      expect(convertMlToOz(100)).toBeCloseTo(3.3814, 4);
      expect(convertMlToOz(0)).toBe(0);
    });

    it("converte oz para ml corretamente", () => {
      expect(convertOzToMl(3.3814)).toBeCloseTo(100, 2);
      expect(convertOzToMl(0)).toBe(0);
    });

    it("interpreta frações comuns no campo de oz", () => {
      expect(parseOunceInput("1/2")).toBe(0.5);
      expect(parseOunceInput("3/4")).toBe(0.75);
      expect(parseOunceInput("1 1/2")).toBe(1.5);
      expect(parseOunceInput("1,25")).toBe(1.25);
    });

    it("retorna zero para frações de oz inválidas", () => {
      expect(parseOunceInput("1/0")).toBe(0);
      expect(parseOunceInput("abc")).toBe(0);
    });
  });

  describe("Comprimento (pés <-> metros)", () => {
    it("converte ft para m corretamente", () => {
      expect(convertFtToM(10)).toBeCloseTo(3.048, 4);
      expect(convertFtToM(0)).toBe(0);
    });

    it("converte m para ft corretamente", () => {
      expect(convertMToFt(3.048)).toBeCloseTo(10, 4);
      expect(convertMToFt(0)).toBe(0);
    });
  });

  describe("Comprimento (polegadas <-> centímetros)", () => {
    it("converte in para cm corretamente", () => {
      expect(convertInToCm(10)).toBeCloseTo(25.4, 4);
      expect(convertInToCm(0)).toBe(0);
    });

    it("converte cm para in corretamente", () => {
      expect(convertCmToIn(25.4)).toBeCloseTo(10, 4);
      expect(convertCmToIn(0)).toBe(0);
    });
  });
});

describe("convertTime", () => {
  it("converts seconds to minutes", () => {
    expect(convertTime(120, "s", "min")).toBe(2);
  });
  it("converts hours to seconds", () => {
    expect(convertTime(1, "h", "s")).toBe(3600);
  });
  it("converts days to hours", () => {
    expect(convertTime(1, "d", "h")).toBe(24);
  });
  it("converts years to days (365-day year)", () => {
    expect(convertTime(2, "ano", "d")).toBe(730);
  });
  it("returns the same value when units match", () => {
    expect(convertTime(5, "min", "min")).toBe(5);
  });
  it("exposes seconds as the base factor", () => {
    expect(TIME_FACTORS.s).toBe(1);
    expect(TIME_FACTORS.ano).toBe(31_536_000);
  });
});
