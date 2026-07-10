import {
  parseDecimal,
  displayPrice,
  compareProducts,
  UNIT_FACTORS,
  DISPLAY_UNIT,
} from "./logic";

describe("Comparador de Preços - Lógica", () => {
  describe("parseDecimal", () => {
    it("converte vírgula decimal", () => {
      expect(parseDecimal("8,50")).toBe(8.5);
    });
    it("retorna NaN para vazio ou inválido", () => {
      expect(parseDecimal("")).toBeNaN();
      expect(parseDecimal("abc")).toBeNaN();
    });
  });

  describe("tabelas de unidades", () => {
    it("usa grama/ml/un como base e kg/L/un como exibição", () => {
      expect(UNIT_FACTORS.peso).toEqual({ g: 1, kg: 1000 });
      expect(UNIT_FACTORS.volume).toEqual({ ml: 1, L: 1000 });
      expect(UNIT_FACTORS.unidade).toEqual({ un: 1 });
      expect(DISPLAY_UNIT).toEqual({ peso: "kg", volume: "L", unidade: "un" });
    });
  });

  describe("displayPrice", () => {
    it("R$8 / 500 g => 16,00 por kg", () => {
      expect(displayPrice({ price: 8, qty: 500, unit: "g" }, "peso")).toBeCloseTo(16, 2);
    });
    it("retorna null para entrada inválida", () => {
      expect(displayPrice({ price: 0, qty: 500, unit: "g" }, "peso")).toBeNull();
      expect(displayPrice({ price: 8, qty: NaN, unit: "g" }, "peso")).toBeNull();
    });
  });

  describe("compareProducts", () => {
    it("cross-unit peso: 500 g a R$8 vs 1,2 kg a R$14 => B ~27% mais barato", () => {
      const r = compareProducts(
        { price: 8, qty: 500, unit: "g" },
        { price: 14, qty: 1.2, unit: "kg" },
        "peso",
      );
      expect(r.winner).toBe("B");
      expect(r.displayPriceA).toBeCloseTo(16, 2);
      expect(r.displayPriceB).toBeCloseTo(11.6667, 2);
      expect(r.displayUnit).toBe("kg");
      expect(r.percentCheaper).toBeCloseTo(27.08, 1);
    });

    it("mesma unidade peso: 1 kg a R$10 vs 5 kg a R$40 => B vence", () => {
      const r = compareProducts(
        { price: 10, qty: 1, unit: "kg" },
        { price: 40, qty: 5, unit: "kg" },
        "peso",
      );
      expect(r.winner).toBe("B");
      expect(r.displayPriceA).toBeCloseTo(10, 2);
      expect(r.displayPriceB).toBeCloseTo(8, 2);
    });

    it("volume ml vs L: 900 ml a R$6 vs 1 L a R$6,50 => B vence", () => {
      const r = compareProducts(
        { price: 6, qty: 900, unit: "ml" },
        { price: 6.5, qty: 1, unit: "L" },
        "volume",
      );
      expect(r.winner).toBe("B");
      expect(r.displayUnit).toBe("L");
      expect(r.displayPriceA).toBeCloseTo(6.6667, 2);
      expect(r.displayPriceB).toBeCloseTo(6.5, 2);
    });

    it("contagem: 12 un a R$9 vs 30 un a R$20 => B vence", () => {
      const r = compareProducts(
        { price: 9, qty: 12, unit: "un" },
        { price: 20, qty: 30, unit: "un" },
        "unidade",
      );
      expect(r.winner).toBe("B");
      expect(r.displayPriceA).toBeCloseTo(0.75, 2);
      expect(r.displayPriceB).toBeCloseTo(0.6667, 2);
    });

    it("empate: mesmo preço por unidade base", () => {
      const r = compareProducts(
        { price: 10, qty: 1, unit: "kg" },
        { price: 20, qty: 2, unit: "kg" },
        "peso",
      );
      expect(r.winner).toBe("empate");
      expect(r.percentCheaper).toBe(0);
    });

    it("apenas um produto válido => winner null, mostra o preço do válido", () => {
      const r = compareProducts(
        { price: 8, qty: 500, unit: "g" },
        { price: NaN, qty: NaN, unit: "g" },
        "peso",
      );
      expect(r.winner).toBeNull();
      expect(r.displayPriceA).toBeCloseTo(16, 2);
      expect(r.displayPriceB).toBeNull();
      expect(r.percentCheaper).toBeNull();
    });

    it("entradas inválidas (zero/negativo/NaN) não lançam erro", () => {
      const r = compareProducts(
        { price: 0, qty: 0, unit: "g" },
        { price: -5, qty: 100, unit: "g" },
        "peso",
      );
      expect(r.winner).toBeNull();
      expect(r.displayPriceA).toBeNull();
      expect(r.displayPriceB).toBeNull();
    });
  });
});
