const getDateRange = (year: number, month: number) => {
  const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  return {
    startDate,
    endDate,
  };
};

export { getDateRange };
