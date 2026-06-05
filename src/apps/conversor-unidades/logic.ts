export const ML_TO_OZ = 0.033814;
export const FT_TO_M = 0.3048;
export const IN_TO_CM = 2.54;

/**
 * Volume conversion: Mililitros (ml) to Onças Fluídas (oz)
 */
export function convertMlToOz(ml: number): number {
  return ml * ML_TO_OZ;
}

export function convertOzToMl(oz: number): number {
  return oz / ML_TO_OZ;
}

export function parseOunceInput(value: string): number {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return 0;

  const fractionMatch = normalized.match(
    /^(\d+(?:\.\d+)?\s+)?(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/,
  );
  if (fractionMatch) {
    const whole = fractionMatch[1] ? parseFloat(fractionMatch[1]) : 0;
    const numerator = parseFloat(fractionMatch[2]);
    const denominator = parseFloat(fractionMatch[3]);

    if (denominator === 0) return 0;
    return whole + numerator / denominator;
  }

  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Length conversion: Pés (ft) to Metros (m)
 */
export function convertFtToM(ft: number): number {
  return ft * FT_TO_M;
}

export function convertMToFt(m: number): number {
  return m / FT_TO_M;
}

/**
 * Length conversion: Polegadas (in) to Centímetros (cm)
 */
export function convertInToCm(inch: number): number {
  return inch * IN_TO_CM;
}

export function convertCmToIn(cm: number): number {
  return cm / IN_TO_CM;
}
