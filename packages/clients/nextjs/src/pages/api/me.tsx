import { type NextApiRequest, type NextApiResponse } from "next";
import { createRemoteJWKSet, jwtVerify } from "jose";
import cookie from "cookie";
import { accessCookie, idCookie } from "./redirect";

export default async function meHandler(
  config: ConferMeConfig,
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.headers.cookie) {
    console.debug("no cookie");
    res.status(403).json({ message: "UNAUTHORIZED" });
    return;
  }

  const cookies = cookie.parse(req.headers.cookie);
  const id = cookies[idCookie];
  const access = cookies[accessCookie];

  if (!id) {
    console.debug("no id");
    res.status(403).json({ message: "UNAUTHORIZED" });
    return;
  }

  if (!access) {
    console.debug("no access");
    res.status(403).json({ message: "UNAUTHORIZED" });
    return;
  }

  const { payload } = await jwtVerify(
    id,
    createRemoteJWKSet(new URL(`${config.oidcUrl}/jwks`)),
    {
      issuer: config.oidcUrl,
      // audience: config.clientId, // audience is whichever client initiated the id token request, which might not be the current consumer?
    }
  );

  const { payload: payloadTwo } = await jwtVerify(
    access,
    createRemoteJWKSet(new URL(`${config.oidcUrl}/jwks`)),
    {
      issuer: config.oidcUrl,
      audience: config.resource,
    }
  );

  res.json(payload);
}

export interface ConferMeConfig {
  clientId: string;
  oidcUrl: string;
  resource: string;
}

export const ConferMeRoute = (config: ConferMeConfig) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    return meHandler(config, req, res);
  };
};
