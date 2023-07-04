import { type NextApiRequest, type NextApiResponse } from "next";
import {
  oidcUrl,
  challengeVerifierCookie,
  challengeVerifierCookieSecret,
  clientBaseUrl,
  clientRedirectUrl,
} from "./sign-in";
import cookie from "cookie";
import signature from "cookie-signature";

export interface CodePayload {
  code?: string;
  iss?: string;
}

export const idCookie = "id";
export const accessCookie = "access";

export default async function redirectHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("\n\n4. REDIRECT HANDLER\n\n");

  if (!req.headers.cookie) {
    console.log("no cookie");
    res.status(403).json({ message: "UNAUTHORIZED" });
    return;
  }

  const cookies = cookie.parse(req.headers.cookie);

  if (!cookies[challengeVerifierCookie]) {
    console.log("no challenge verifier cookie");
    res.status(403).json({ message: "UNAUTHORIZED" });
    return;
  }

  const verifier = signature.unsign(
    cookies[challengeVerifierCookie],
    challengeVerifierCookieSecret
  );

  const query = req.query as CodePayload | undefined;

  if (!verifier) {
    console.log("no challenge verifier");
    res.status(403).json({ message: "UNAUTHORIZED" });
    return;
  }

  if (!query || !query.code) {
    console.log("no query code");
    res.status(403).json({ message: "UNAUTHORIZED" });
    return;
  }

  if (!query || !query.iss || query.iss !== oidcUrl) {
    console.log("no iss match");
    res.status(403).json({ message: "UNAUTHORIZED" });
    return;
  }

  const baseUrl = `${oidcUrl}/token`;
  const data = new URLSearchParams();
  data.set("client_id", "ergergergegr");
  data.set("client_secret", "7Fjfp0ZBr1KtDRbnfVdmIw");
  data.set("code", query.code);
  data.set("redirect_uri", clientRedirectUrl);
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

  console.log(result, "token exchange result");

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

  res.redirect(307, clientBaseUrl);
}
