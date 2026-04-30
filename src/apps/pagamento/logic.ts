export interface PagamentoInputs {
  cashPrice: number;
  installmentPrice: number;
  installments: number;
  monthlyReturn: number;
  cashbackRate: number;
}

export interface PagamentoResults {
  effectiveCostVista: number;
  effectiveCostPrazo: number;
  savings: number;
  verdict: 'vista' | 'prazo' | 'equal';
  breakEvenDiscount: number;
}

/**
 * Calculate effective cost of paying à prazo.
 *
 * If you pay in installments, you keep the cash and invest it.
 * Each month you pay one installment from your invested pool.
 * The effective cost is: installmentPrice - investmentGains - cashback.
 */
export function compare(inputs: PagamentoInputs): PagamentoResults {
  const { cashPrice, installmentPrice, installments, monthlyReturn, cashbackRate } = inputs;

  // Edge case: zero installments means you must pay cash
  if (installments <= 0) {
    return {
      effectiveCostVista: cashPrice,
      effectiveCostPrazo: installmentPrice,
      savings: installmentPrice - cashPrice,
      verdict: cashPrice <= installmentPrice ? 'vista' : 'prazo',
      breakEvenDiscount: 0,
    };
  }

  const monthlyPayment = installmentPrice / installments;

  // Effective cost of à vista: you pay cashPrice now, losing all future returns
  const effectiveCostVista = cashPrice;

  // Effective cost of à prazo: simulate investing cashPrice and paying monthly
  // Each month: balance grows by monthlyReturn, then you subtract one payment
  let balance = cashPrice; // you invest the cash amount
  let totalInvestmentGains = 0;

  for (let month = 1; month <= installments; month++) {
    const gain = balance * monthlyReturn;
    totalInvestmentGains += gain;
    balance = balance + gain - monthlyPayment;
  }

  const cashback = installmentPrice * cashbackRate;
  const effectiveCostPrazo = installmentPrice - totalInvestmentGains - cashback;

  const diff = effectiveCostVista - effectiveCostPrazo;
  const EPSILON = 0.005;

  let verdict: 'vista' | 'prazo' | 'equal';
  if (Math.abs(diff) < EPSILON) {
    verdict = 'equal';
  } else if (diff < 0) {
    verdict = 'vista';
  } else {
    verdict = 'prazo';
  }

  const savings = Math.abs(diff);

  // Break-even: what cashPrice (as % discount off installmentPrice) makes vista = prazo?
  // effectiveCostVista = cashPrice_be
  // effectiveCostPrazo = installmentPrice - gains(cashPrice_be) - cashback
  // We solve numerically: find cashPrice_be where costs are equal
  let breakEvenDiscount = 0;
  if (installmentPrice > 0) {
    let lo = 0;
    let hi = installmentPrice;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      let bal = mid;
      let gains = 0;
      for (let m = 1; m <= installments; m++) {
        const g = bal * monthlyReturn;
        gains += g;
        bal = bal + g - monthlyPayment;
      }
      const costPrazo = installmentPrice - gains - cashback;
      if (mid < costPrazo) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    const breakEvenPrice = (lo + hi) / 2;
    breakEvenDiscount = ((installmentPrice - breakEvenPrice) / installmentPrice) * 100;
  }

  return {
    effectiveCostVista,
    effectiveCostPrazo,
    savings,
    verdict,
    breakEvenDiscount: Math.max(0, breakEvenDiscount),
  };
}
