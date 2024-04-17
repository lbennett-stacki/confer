import { ConferRedirectRoute } from "@confer/nextjs";
import {
  oidcUrl,
  clientId,
  clientSecret,
  clientBaseUrl,
  clientRedirectUri,
} from "../../../config";

export default ConferRedirectRoute({
  oidcUrl,
  clientId,
  clientSecret,
  clientBaseUrl,
  redirectUrl: clientRedirectUri,
});
