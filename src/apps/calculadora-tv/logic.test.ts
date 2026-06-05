import { calculateDistanceRange, calculateSizeRange } from "./logic";

describe("Calculadora de TV - Lógica", () => {
  describe("Tamanho -> Distância", () => {
    it("calcula a distância ideal para TV de 55 polegadas", () => {
      const range = calculateDistanceRange(55);
      // 55 * 0.03048 = 1.6764
      // 55 * 0.04064 = 2.2352
      expect(range.minDistance).toBeCloseTo(1.68, 2);
      expect(range.maxDistance).toBeCloseTo(2.24, 2);
      expect(range.idealDistance).toBeCloseTo(1.96, 2);
    });

    it("retorna zeros para tamanho inválido", () => {
      const range = calculateDistanceRange(-10);
      expect(range.minDistance).toBe(0);
      expect(range.maxDistance).toBe(0);
      expect(range.idealDistance).toBe(0);
    });
  });

  describe("Distância -> Tamanho", () => {
    it("calcula o tamanho recomendado para distância de 2 metros", () => {
      const range = calculateSizeRange(2);
      // 2 / 0.04064 = 49.21
      // 2 / 0.03048 = 65.6167979... -> rounds to 65.62
      expect(range.minSize).toBeCloseTo(49.21, 2);
      expect(range.maxSize).toBeCloseTo(65.62, 2);
      expect(range.idealSize).toBeCloseTo(57.41, 2);
    });

    it("retorna zeros para distância inválida", () => {
      const range = calculateSizeRange(-2);
      expect(range.minSize).toBe(0);
      expect(range.maxSize).toBe(0);
      expect(range.idealSize).toBe(0);
    });
  });
});
