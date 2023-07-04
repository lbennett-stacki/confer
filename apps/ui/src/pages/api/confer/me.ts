import { type NextApiRequest, type NextApiResponse } from "next";
import { createRemoteJWKSet, jwtVerify } from "jose";
import cookie from "cookie";
import { accessCookie, idCookie } from "./redirect";
import { oidcUrl, testResource } from "./sign-in";

export interface CodePayload {
  code?: string;
  iss?: string;
}

export default async function meHandler(
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
    createRemoteJWKSet(new URL(`${oidcUrl}/jwks`)),
    {
      issuer: oidcUrl,
      audience: "ergergergegr",
    }
  );

  const { payload: payloadTwo } = await jwtVerify(
    access,
    createRemoteJWKSet(new URL(`${oidcUrl}/jwks`)),
    {
      issuer: oidcUrl,
      audience: testResource,
    }
  );

  res.json(payload);
}
