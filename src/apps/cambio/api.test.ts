// Set env BEFORE importing the module (module-level const reads it at import time)
process.env.EXPO_PUBLIC_EXCHANGE_API_KEY = "test-api-key";

import { getRates } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock fetch and AsyncStorage
global.fetch = jest.fn();
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockRates = { USD: 5.0, EUR: 5.5, CHF: 5.8 };

const freshCacheEntry = JSON.stringify({
  rates: mockRates,
  fetchedAt: Date.now(),
});

const staleCacheEntry = JSON.stringify({
  rates: mockRates,
  fetchedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
});

/** v6 API response shape */
const mockV6Response = {
  result: "success",
  conversion_rates: { USD: 0.2, EUR: 0.18, CHF: 0.17 },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getRates", () => {
  it("returns cached rates when cache is fresh", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(freshCacheEntry);

    const result = await getRates();
    expect(result.rates).toEqual(mockRates);
    expect(result.isStale).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fetches new rates when cache is stale", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(staleCacheEntry);
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockV6Response),
    });

    const result = await getRates();
    expect(fetch).toHaveBeenCalled();
    expect(result.isStale).toBe(false);
    expect(result.rates.USD).toBeCloseTo(5.0, 1);
  });

  it("falls back to stale cache on API failure", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(staleCacheEntry);
    (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    const result = await getRates();
    expect(result.rates).toEqual(mockRates);
    expect(result.isStale).toBe(true);
    expect(result.error).toBeTruthy();
  });

  it("throws when no cache and API fails", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    await expect(getRates()).rejects.toThrow(
      "Não foi possível obter as cotações",
    );
  });

  it("force refresh bypasses fresh cache", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(freshCacheEntry);
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockV6Response),
    });

    const result = await getRates(true);
    expect(fetch).toHaveBeenCalled();
    expect(result.isStale).toBe(false);
  });

  it("falls back to stale cache on API error response", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(staleCacheEntry) // stale check → stale
      .mockResolvedValueOnce(staleCacheEntry); // fallback check
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          result: "error",
          "error-type": "invalid-key",
        }),
    });

    const result = await getRates();
    expect(result.isStale).toBe(true);
    expect(result.rates).toEqual(mockRates);
  });

  it("throws when API fails and no cache exists", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          result: "error",
          "error-type": "invalid-key",
        }),
    });

    await expect(getRates()).rejects.toThrow(
      "Não foi possível obter as cotações",
    );
  });
});
