const calculateDifferencePercent = (currentAmount: number, previousAmount: number) =>
  previousAmount > 0 ? Math.round(((currentAmount - previousAmount) / previousAmount) * 100) : 0;

export { calculateDifferencePercent };
