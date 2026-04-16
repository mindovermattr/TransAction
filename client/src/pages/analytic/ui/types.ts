export type ChartProps<T> = {
  data?: T;
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
};
