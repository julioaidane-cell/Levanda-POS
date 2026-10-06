/**
 * Currency code cache for `formatCurrency`.
 *
 * The code comes from the API (`/currencies` matched against the company's
 * `currency_id`), so nothing about the shop's currency is hardcoded. Until it
 * resolves — or when the company record is unknown — prices are formatted as
 * plain numbers instead of guessing a symbol.
 */
let symbol: string | null = null;

export function setCurrencyCode(code: string | null | undefined): void {
  const trimmed = code?.trim();
  symbol = trimmed !== undefined && trimmed.length > 0 ? trimmed.toUpperCase() : null;
}

export function getCurrencyCode(): string | null {
  return symbol;
}