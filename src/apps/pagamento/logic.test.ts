import { compare, type PagamentoInputs } from './logic';

describe('Pagamento - compare', () => {
  it('à vista is cheaper when discount is large enough', () => {
    const inputs: PagamentoInputs = {
      cashPrice: 900,
      installmentPrice: 1000,
      installments: 10,
      monthlyReturn: 0.008, // 0.8% per month
      cashbackRate: 0.01,   // 1% cashback
    };
    const result = compare(inputs);
    expect(result.verdict).toBe('vista');
    expect(result.savings).toBeGreaterThan(0);
  });

  it('à prazo is cheaper when discount is small and returns are high', () => {
    const inputs: PagamentoInputs = {
      cashPrice: 990,
      installmentPrice: 1000,
      installments: 12,
      monthlyReturn: 0.01,  // 1% per month
      cashbackRate: 0.02,   // 2% cashback
    };
    const result = compare(inputs);
    expect(result.verdict).toBe('prazo');
    expect(result.savings).toBeGreaterThan(0);
  });

  it('applies cashback correctly', () => {
    const inputs: PagamentoInputs = {
      cashPrice: 1000,
      installmentPrice: 1000,
      installments: 10,
      monthlyReturn: 0,
      cashbackRate: 0.05,   // 5% cashback
    };
    const result = compare(inputs);
    // With 0% returns and 5% cashback on prazo, prazo should win
    expect(result.verdict).toBe('prazo');
  });

  it('calculates investment returns over installment period', () => {
    const inputs: PagamentoInputs = {
      cashPrice: 1000,
      installmentPrice: 1000,
      installments: 12,
      monthlyReturn: 0.01, // 1%/month
      cashbackRate: 0,
    };
    const result = compare(inputs);
    // Equal prices but you earn returns by paying in installments
    expect(result.verdict).toBe('prazo');
    expect(result.savings).toBeGreaterThan(0);
  });

  it('break-even discount is positive', () => {
    const inputs: PagamentoInputs = {
      cashPrice: 900,
      installmentPrice: 1000,
      installments: 10,
      monthlyReturn: 0.008,
      cashbackRate: 0.01,
    };
    const result = compare(inputs);
    expect(result.breakEvenDiscount).toBeGreaterThan(0);
    expect(result.breakEvenDiscount).toBeLessThan(100);
  });

  it('handles zero installments gracefully', () => {
    const inputs: PagamentoInputs = {
      cashPrice: 900,
      installmentPrice: 1000,
      installments: 0,
      monthlyReturn: 0.008,
      cashbackRate: 0.01,
    };
    const result = compare(inputs);
    expect(result.verdict).toBe('vista');
  });

  it('handles equal prices with no returns or cashback', () => {
    const inputs: PagamentoInputs = {
      cashPrice: 1000,
      installmentPrice: 1000,
      installments: 10,
      monthlyReturn: 0,
      cashbackRate: 0,
    };
    const result = compare(inputs);
    expect(result.verdict).toBe('equal');
  });
});
