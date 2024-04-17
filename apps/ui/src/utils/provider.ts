import { providerFactory } from "@confer/oidc-provider";
import { IncomingMessage, ServerResponse } from "http";
import { Http2ServerRequest, Http2ServerResponse } from "http2";
import Provider from "oidc-provider";
import { GlobalRef } from "./global-ref";

export type ProviderMiddleware = (
  req: IncomingMessage | Http2ServerRequest,
  res: ServerResponse | Http2ServerResponse
) => Promise<void>;

const providerRef = new GlobalRef<Provider>("provider");
if (!providerRef.value) {
  providerRef.value = providerFactory();
}

export const provider = providerRef.value;

export const providerMiddleware = provider.callback();
