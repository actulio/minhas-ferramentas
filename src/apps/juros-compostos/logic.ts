/**
 * A = P × (1 + r/n)^(n × t)
 */
export function solveForA(P: number, r: number, n: number, t: number): number {
  if (t === 0 || r === 0) return P;
  return P * Math.pow(1 + r / n, n * t);
}

/**
 * P = A / (1 + r/n)^(n × t)
 */
export function solveForP(A: number, r: number, n: number, t: number): number {
  if (t === 0 || r === 0) return A;
  return A / Math.pow(1 + r / n, n * t);
}

/**
 * r = n × [(A/P)^(1/(n×t)) - 1]
 */
export function solveForR(A: number, P: number, n: number, t: number): number {
  if (P === 0 || n === 0 || t === 0) return 0;
  return n * (Math.pow(A / P, 1 / (n * t)) - 1);
}

/**
 * t = ln(A/P) / (n × ln(1 + r/n))
 */
export function solveForT(A: number, P: number, r: number, n: number): number {
  if (P === 0 || r === 0 || n === 0) return 0;
  const ratio = A / P;
  if (ratio <= 0) return 0;
  return Math.log(ratio) / (n * Math.log(1 + r / n));
}

/**
 * Solve for n numerically using binary search.
 * A = P × (1 + r/n)^(n × t) — no closed-form for n.
 */
export function solveForN(A: number, P: number, r: number, t: number): number {
  if (P === 0 || r === 0 || t === 0) return 0;

  const target = A / P;
  let lo = 0.1;
  let hi = 365; // daily compounding as upper bound

  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const computed = Math.pow(1 + r / mid, mid * t);

    if (Math.abs(computed - target) < 1e-9) return mid;

    // As n increases, (1+r/n)^(nt) approaches e^(rt) — monotonically increasing
    if (computed < target) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return (lo + hi) / 2;
}

export function monthsToYears(months: number): number {
  return months / 12;
}
