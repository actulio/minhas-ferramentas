import { loadJSON, saveJSON } from "@/store/storage";
import { type ExchangeRates } from "./logic";

const CACHE_KEY = "cambio-rates-cache";
const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour
const API_URL =
  process.env.EXPO_PUBLIC_EXCHANGE_API_URL ||
  "https://api.exchangerate-api.com/v4/latest/BRL";

interface CachedRates {
  rates: ExchangeRates;
  fetchedAt: number; // Date.now() timestamp
}

export interface RatesResult {
  rates: ExchangeRates;
  fetchedAt: Date;
  isStale: boolean;
  error?: string;
}

async function fetchFreshRates(): Promise<ExchangeRates> {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();

  // API returns rates relative to BRL, e.g. { USD: 0.2 } means 1 BRL = 0.2 USD
  // We want "1 USD = X BRL", so invert
  return {
    USD: 1 / data.rates.USD,
    EUR: 1 / data.rates.EUR,
    CHF: 1 / data.rates.CHF,
  };
}

export async function getRates(forceRefresh = false): Promise<RatesResult> {
  // Check cache first
  if (!forceRefresh) {
    const cached = await loadJSON<CachedRates>(CACHE_KEY);
    if (cached && Date.now() - cached.fetchedAt < CACHE_MAX_AGE_MS) {
      return {
        rates: cached.rates,
        fetchedAt: new Date(cached.fetchedAt),
        isStale: false,
      };
    }
  }

  // Try to fetch fresh rates
  try {
    const rates = await fetchFreshRates();
    const now = Date.now();
    await saveJSON(CACHE_KEY, { rates, fetchedAt: now });
    return { rates, fetchedAt: new Date(now), isStale: false };
  } catch {
    // Fall back to stale cache
    const cached = await loadJSON<CachedRates>(CACHE_KEY);
    if (cached) {
      return {
        rates: cached.rates,
        fetchedAt: new Date(cached.fetchedAt),
        isStale: true,
        error: "Usando cotações em cache. Não foi possível atualizar.",
      };
    }

    // No cache at all
    throw new Error(
      "Não foi possível obter as cotações. Verifique sua conexão.",
    );
  }
}
