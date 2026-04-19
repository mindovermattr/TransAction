interface MutationSettings<Params = void, Func = unknown> {
  config?: ApiRequestConfig;
  options?: import("@tanstack/react-query").UseMutationOptions<
    Awaited<ReturnType<Func>>,
    any,
    Params,
    any
  >;
}

interface QuerySettings<Func = unknown> {
  config?: ApiRequestConfig;
  options?: Omit<
    import("@tanstack/react-query").UseQueryOptions<
      Awaited<ReturnType<Func>>,
      any,
      Awaited<ReturnType<Func>>,
      any
    >,
    "queryKey"
  >;
}

interface InfiniteQuerySettings<Func = unknown> {
  config?: ApiRequestConfig;
  options?: Omit<
    import("@tanstack/react-query").UseInfiniteQueryOptions<
      Awaited<ReturnType<Func>>,
      any,
      Awaited<ReturnType<Func>>,
      any
    >,
    "queryKey" | "initialData"
  >;
}

type ApiRequestConfig<ResponseType = "json"> =
  import("ofetch").FetchOptions<ResponseType>;

type OfetchRequestConfig<
  Params = undefined,
  ResponseType = "json",
  ParamsOptional extends boolean = false,
> = [Params] extends [undefined]
  ? { config?: ApiRequestConfig<ResponseType> }
  : ParamsOptional extends true
    ? { params?: Params; config?: ApiRequestConfig<ResponseType> }
    : { params: Params; config?: ApiRequestConfig<ResponseType> };
