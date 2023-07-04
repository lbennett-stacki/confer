import pkceChallenge from "pkce-challenge";
import cookie from "cookie";
import signature from "cookie-signature";
import { type NextApiRequest, type NextApiResponse } from "next";
import { interactionCookie } from "./[id]";

export const authBaseUrl = "http://localhost:3001";
export const oidcUrl = `${authBaseUrl}/api/oidc`;
export const clientBaseUrl = "http://localhost:3001";
export const clientRedirectUrl = `${clientBaseUrl}/api/confer/redirect`;

export const challengeVerifierCookieSecret = "secrets";
export const challengeVerifierCookie = "challengeVerifier";

export const testResource = `${clientBaseUrl}/api/trpc`;

export default async function signInHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("\n\n1. AUTH START\n\n");
  const challenge = await pkceChallenge();

  const baseUrl = `${oidcUrl}/auth`;
  const params = new URLSearchParams();
  params.set("client_id", "ergergergegr");
  params.set("redirect_uri", clientRedirectUrl);
  params.set("response_type", "code");
  params.set("scope", "openid profile offline_access test");
  params.set("code_challenge", challenge.code_challenge);
  params.set("code_challenge_method", "S256");
  params.set("resource", testResource);

  res.setHeader("Set-Cookie", [
    cookie.serialize(
      challengeVerifierCookie,
      signature.sign(challenge.code_verifier, challengeVerifierCookieSecret),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 60 * 10, // 10 minutes
        sameSite: "strict",
        path: "/",
      }
    ),
    // clear interaction cookie
    cookie.serialize(interactionCookie, "REVOKED", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      expires: new Date(0), // force expire
      sameSite: "strict",
      path: "/",
    }),
  ]);

  res.redirect(307, `${baseUrl}?${params.toString()}`);
}
