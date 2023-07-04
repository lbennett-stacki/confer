import { type NextApiRequest, type NextApiResponse } from "next";
import {
  challengeVerifierCookie,
  challengeVerifierCookieSecret,
} from "./sign-in";
import cookie from "cookie";
import signature from "cookie-signature";

export interface CodePayload {
  code?: string;
  iss?: string;
}

export const idCookie = "id";
export const accessCookie = "access";

export interface ConferRedirectConfig {
  clientId: string;
  clientSecret: string;
  clientBaseUrl: string;
  redirectUrl: string;
  oidcUrl: string;
}

export default async function redirectHandler(
  config: ConferRedirectConfig,
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.headers.cookie) {
    console.debug("no cookie");
    res.status(403).json({ message: "UNAUTHORIZED" });
    return;
  }

  const cookies = cookie.parse(req.headers.cookie);

  if (!cookies[challengeVerifierCookie]) {
    console.debug("no challenge verifier cookie");
    res.status(403).json({ message: "UNAUTHORIZED" });
    return;
  }

  const verifier = signature.unsign(
    cookies[challengeVerifierCookie],
    challengeVerifierCookieSecret
  );

  const query = req.query as CodePayload | undefined;

  if (!verifier) {
    console.debug("no challenge verifier");
    res.status(403).json({ message: "UNAUTHORIZED" });
    return;
  }

  if (!query || !query.code) {
    console.debug("no query code");
    res.status(403).json({ message: "UNAUTHORIZED" });
    return;
  }

  if (!query || !query.iss || query.iss !== config.oidcUrl) {
    console.debug("no iss match");
    res.status(403).json({ message: "UNAUTHORIZED" });
    return;
  }

  const baseUrl = `${config.oidcUrl}/token`;
  const data = new URLSearchParams();
  data.set("client_id", config.clientId);
  data.set("client_secret", config.clientSecret);
  data.set("code", query.code);
  data.set("redirect_uri", config.redirectUrl);
  data.set("code_verifier", verifier);
  data.set("grant_type", "authorization_code");

  const response = await fetch(baseUrl, {
    method: "POST",
    body: data.toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/x-www-form-urlencoded",
    },
  });
  const result = await response.json();

  const accessToken = result.access_token;
  const expiresIn = result.expires_in;
  const idToken = result.id_token;
  const scope = result.scope;

  if (!accessToken || !expiresIn || !idToken || !scope) {
    res.status(403).json({ message: "UNAUTHORIZED" });
    return;
  }

  res.setHeader("Set-Cookie", [
    cookie.serialize(challengeVerifierCookie, "REVOKED", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      expires: new Date(0),
      sameSite: "strict",
      path: "/",
    }),
    // TODO: finish up access/id session management, don't use this
    cookie.serialize(idCookie, idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "strict",
      path: "/",
    }),
    cookie.serialize(accessCookie, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "strict",
      path: "/",
    }),
  ]);

  res.redirect(307, config.clientBaseUrl);
}

export const ConferRedirectRoute = (config: ConferRedirectConfig) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    return redirectHandler(config, req, res);
  };
};
