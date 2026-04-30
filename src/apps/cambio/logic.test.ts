import { convertCurrency, convertAll, type ExchangeRates } from './logic';

const mockRates: ExchangeRates = {
  USD: 5.0,   // 1 USD = 5 BRL
  EUR: 5.5,   // 1 EUR = 5.5 BRL
  CHF: 5.8,   // 1 CHF = 5.8 BRL
};

describe('convertCurrency', () => {
  it('converts BRL to USD', () => {
    const result = convertCurrency(100, 'BRL', 'USD', mockRates);
    expect(result).toBeCloseTo(20, 2);
  });

  it('converts USD to BRL', () => {
    const result = convertCurrency(20, 'USD', 'BRL', mockRates);
    expect(result).toBeCloseTo(100, 2);
  });

  it('converts EUR to CHF (cross-rate via BRL)', () => {
    // 10 EUR = 55 BRL = 55/5.8 CHF ≈ 9.48
    const result = convertCurrency(10, 'EUR', 'CHF', mockRates);
    expect(result).toBeCloseTo(9.48, 1);
  });

  it('returns 0 for zero amount', () => {
    expect(convertCurrency(0, 'USD', 'BRL', mockRates)).toBe(0);
  });

  it('returns same amount for same currency', () => {
    expect(convertCurrency(100, 'USD', 'USD', mockRates)).toBe(100);
  });
});

describe('convertAll', () => {
  it('converts from BRL to all currencies', () => {
    const result = convertAll(100, 'BRL', mockRates);
    expect(result.USD).toBeCloseTo(20, 2);
    expect(result.EUR).toBeCloseTo(18.18, 1);
    expect(result.CHF).toBeCloseTo(17.24, 1);
    expect(result.BRL).toBe(100);
  });

  it('converts from USD to all currencies', () => {
    const result = convertAll(10, 'USD', mockRates);
    expect(result.BRL).toBeCloseTo(50, 2);
    expect(result.EUR).toBeCloseTo(9.09, 1);
    expect(result.CHF).toBeCloseTo(8.62, 1);
    expect(result.USD).toBe(10);
  });
});
