import { ConferMeRoute } from "@confer/nextjs";
import { clientId, oidcUrl, testResource } from "../../../config";

export default ConferMeRoute({
  clientId,
  oidcUrl,
  resource: testResource,
});
