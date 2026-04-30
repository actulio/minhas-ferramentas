import { loadJSON, saveJSON } from "@/store/storage";
import { type ExchangeRates } from "./logic";

const CACHE_KEY = "cambio-rates-cache";
const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

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

function getApiUrl(): string {
  const key = process.env.EXPO_PUBLIC_EXCHANGE_API_KEY;
  if (!key) {
    throw new Error(
      "EXPO_PUBLIC_EXCHANGE_API_KEY não configurada. Veja .env.example.",
    );
  }
  return `https://v6.exchangerate-api.com/v6/${key}/latest/BRL`;
}

async function fetchFreshRates(): Promise<ExchangeRates> {
  const url = getApiUrl();
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();

  if (data.result !== "success") {
    throw new Error(data["error-type"] || "Erro na API de câmbio");
  }

  // v6 API returns conversion_rates relative to BRL
  // e.g. { USD: 0.17 } means 1 BRL = 0.17 USD → we want 1 USD = X BRL, so invert
  return {
    USD: 1 / data.conversion_rates.USD,
    EUR: 1 / data.conversion_rates.EUR,
    CHF: 1 / data.conversion_rates.CHF,
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
