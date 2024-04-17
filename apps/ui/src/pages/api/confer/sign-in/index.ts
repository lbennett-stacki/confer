import { ConferSignInRoute } from "@confer/nextjs";
import {
  oidcUrl,
  clientId,
  clientRedirectUri,
  testResource,
} from "../../../../config";

export default ConferSignInRoute({
  oidcUrl,
  clientId,
  redirectUrl: clientRedirectUri,
  resource: testResource,
});
