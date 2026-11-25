export function formatMoney(cents: number): string {
  const neg = cents < 0;
  const abs = Math.abs(cents);
  const formatted = (abs / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${neg ? '-' : ''}$${formatted}`;
}

export function formatMoneyWhole(cents: number): string {
  const neg = cents < 0;
  const abs = Math.round(Math.abs(cents) / 100);
  return `${neg ? '-' : ''}$${abs.toLocaleString('en-US')}`;
}
