export type ChartProps<T> = {
  data?: T;
  isInitialLoading: boolean;
  isRefreshing?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};
