export type CurrencyCode = 'USD' | 'EUR' | 'CHF' | 'BRL';

// Rates are stored as "1 foreign currency = X BRL"
export type ExchangeRates = Record<'USD' | 'EUR' | 'CHF', number>;

export const currencyInfo: Record<CurrencyCode, { name: string; flag: string }> = {
  USD: { name: 'Dólar Americano', flag: '🇺🇸' },
  EUR: { name: 'Euro', flag: '🇪🇺' },
  CHF: { name: 'Franco Suíço', flag: '🇨🇭' },
  BRL: { name: 'Real Brasileiro', flag: '🇧🇷' },
};

export const foreignCurrencies: Array<'USD' | 'EUR' | 'CHF'> = ['USD', 'EUR', 'CHF'];

/**
 * Convert an amount from one currency to another.
 * Rates are "1 foreign = X BRL".
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: ExchangeRates,
): number {
  if (amount === 0 || from === to) return amount;

  // Convert to BRL first
  let brlAmount: number;
  if (from === 'BRL') {
    brlAmount = amount;
  } else {
    brlAmount = amount * rates[from];
  }

  // Convert from BRL to target
  if (to === 'BRL') return brlAmount;
  return brlAmount / rates[to];
}

/**
 * Convert an amount in one currency to all 4 currencies.
 */
export function convertAll(
  amount: number,
  from: CurrencyCode,
  rates: ExchangeRates,
): Record<CurrencyCode, number> {
  return {
    USD: from === 'USD' ? amount : convertCurrency(amount, from, 'USD', rates),
    EUR: from === 'EUR' ? amount : convertCurrency(amount, from, 'EUR', rates),
    CHF: from === 'CHF' ? amount : convertCurrency(amount, from, 'CHF', rates),
    BRL: from === 'BRL' ? amount : convertCurrency(amount, from, 'BRL', rates),
  };
}
