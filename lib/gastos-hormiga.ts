// Maths and limits of the gastos hormiga calculator (small recurring expenses).
//
// Pure module with no constants that expire. The Centavos API implements the
// same formulas and the same limits for the saved lists, so the names here
// follow the contract (see lib/gastos-hormiga-api.ts) and the two can be
// compared side by side. Spec: docs/calculadoras/gastos-hormiga.md.

export type Period = "day" | "week" | "month";

export const PERIODS: readonly Period[] = ["day", "week", "month"];

/** Occurrences of each period in a year. */
export const PER_YEAR: Record<Period, number> = { day: 365, week: 52, month: 12 };

/** The app's expense categories. Rows typed by hand go as `other`. */
export const CATEGORIES = [
  "food",
  "transport",
  "entertainment",
  "health",
  "home",
  "clothing",
  "education",
  "other",
  "pets",
  "travel",
  "gifts",
  "personal_care",
  "utilities",
  "debt",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Limits of a saved list. The form enforces them so a list that looks valid on
// screen is never rejected by the API.
export const MAX_ITEMS = 30;
export const MAX_NAME = 60;
export const MAX_AMOUNT = 100000;
export const MAX_TIMES = 50;

export type Item = {
  name: string;
  /** Cost of ONE occurrence. */
  amount: number;
  /** How many times per period. */
  times: number;
  period: Period;
  category?: Category;
};

/** Rounds to cents. Only for display: never round in the middle of a sum. */
export function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

/** Whether the item is within the limits of the contract. */
export function isValidItem(item: Item): boolean {
  const name = item.name.trim();
  return (
    name.length >= 1 &&
    name.length <= MAX_NAME &&
    Number.isFinite(item.amount) &&
    item.amount > 0 &&
    item.amount <= MAX_AMOUNT &&
    round2(item.amount) === item.amount &&
    Number.isInteger(item.times) &&
    item.times >= 1 &&
    item.times <= MAX_TIMES &&
    PERIODS.includes(item.period) &&
    (item.category === undefined || CATEGORIES.includes(item.category))
  );
}

export function itemYearly(item: Item): number {
  return item.amount * item.times * PER_YEAR[item.period];
}

export function itemMonthly(item: Item): number {
  return itemYearly(item) / 12;
}

export type Totals = { yearly: number; monthly: number };

/**
 * Totals of a list. Invalid items are left out, and a list with no valid item
 * gives `null`, so the page hides the result instead of rendering NaN.
 */
export function totals(items: Item[]): Totals | null {
  const valid = items.filter(isValidItem);
  if (valid.length === 0) return null;
  const yearly = valid.reduce((sum, item) => sum + itemYearly(item), 0);
  return { yearly, monthly: yearly / 12 };
}
