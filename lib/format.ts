const irtFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

export function formatIRT(value: number): string {
  return irtFormatter.format(Math.round(value));
}

export function formatGeneralCurrency(value: number): string {
  return currencyFormatter.format(value);
}
