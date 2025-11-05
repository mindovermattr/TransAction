const getDateRange = (year: number, month: number) => {
  const startDate = new Date(Date.UTC(year, month, 0));
  const endDate = new Date(Date.UTC(year, month + 1, 0));

  return {
    startDate,
    endDate,
  };
};

export { getDateRange };
