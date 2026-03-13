export const currencyFormatter = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
  minimumFractionDigits: 2,
});

export const formatCurrency = (value: number): string => {
  return currencyFormatter.format(value);
};
