import { validateCPF, validateCNPJ, generateCPF, generateCNPJ } from "./logic";

describe("Gerador e Validador de Documentos - Lógica", () => {
  describe("CPF", () => {
    it("valida CPFs corretos conhecidos", () => {
      // Test with some standard algorithmically valid CPFs
      expect(validateCPF("529.982.247-25")).toBe(true);
      expect(validateCPF("52998224725")).toBe(true);
    });

    it("rejeita CPFs com formato incorreto ou inválidos", () => {
      expect(validateCPF("111.111.111-11")).toBe(false); // identical numbers
      expect(validateCPF("123.456.789-00")).toBe(false); // mathematically invalid
      expect(validateCPF("12345")).toBe(false); // too short
    });

    it("gera CPFs que passam na própria validação", () => {
      for (let i = 0; i < 50; i++) {
        const cpf = generateCPF(false);
        expect(cpf).toHaveLength(11);
        expect(validateCPF(cpf)).toBe(true);
      }
    });

    it("gera CPFs formatados corretamente", () => {
      const formattedCpf = generateCPF(true);
      expect(formattedCpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
      expect(validateCPF(formattedCpf)).toBe(true);
    });
  });

  describe("CNPJ", () => {
    it("valida CNPJs corretos conhecidos", () => {
      // Test with some standard algorithmically valid CNPJs
      expect(validateCNPJ("11.222.333/0001-81")).toBe(true);
      expect(validateCNPJ("11222333000181")).toBe(true);
    });

    it("rejeita CNPJs incorretos", () => {
      expect(validateCNPJ("11.111.111/1111-11")).toBe(false); // identical
      expect(validateCNPJ("11.222.333/0001-00")).toBe(false); // mathematically invalid
      expect(validateCNPJ("123")).toBe(false); // too short
    });

    it("gera CNPJs que passam na própria validação", () => {
      for (let i = 0; i < 50; i++) {
        const cnpj = generateCNPJ(false);
        expect(cnpj).toHaveLength(14);
        expect(validateCNPJ(cnpj)).toBe(true);
      }
    });

    it("gera CNPJs formatados corretamente", () => {
      const formattedCnpj = generateCNPJ(true);
      expect(formattedCnpj).toMatch(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
      expect(validateCNPJ(formattedCnpj)).toBe(true);
    });
  });
});
