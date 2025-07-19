type OfetchRequestConfig<
  Params = undefined,
  ResponseType = "json",
> = Params extends undefined
  ? { config?: import("ofetch").FetchOptions<ResponseType> }
  : { params: Params; config?: import("ofetch").FetchOptions<ResponseType> };
