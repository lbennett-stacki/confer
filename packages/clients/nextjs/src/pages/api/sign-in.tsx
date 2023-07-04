import pkceChallenge from "pkce-challenge";
import cookie from "cookie";
import signature from "cookie-signature";
import { type NextApiRequest, type NextApiResponse } from "next";

// TODO: move to config
export const challengeVerifierCookieSecret = "secrets";
export const challengeVerifierCookie = "challengeVerifier";

export const interactionCookie = "ConferInteraction";

export interface ConferSignInConfig {
  clientId: string;
  redirectUrl: string;
  oidcUrl: string;
  resource: string;
}

export default async function signInHandler(
  config: ConferSignInConfig,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const challenge = await pkceChallenge();

  const baseUrl = `${config.oidcUrl}/auth`;
  const params = new URLSearchParams();
  params.set("client_id", config.clientId);
  params.set("redirect_uri", config.redirectUrl);
  params.set("response_type", "code");
  params.set("scope", "openid profile offline_access test");
  params.set("code_challenge", challenge.code_challenge);
  params.set("code_challenge_method", "S256");
  params.set("resource", config.resource);

  res.setHeader("Set-Cookie", [
    cookie.serialize(
      challengeVerifierCookie,
      signature.sign(challenge.code_verifier, challengeVerifierCookieSecret),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 60 * 10,
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

export const ConferSignInRoute = (config: ConferSignInConfig) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    return signInHandler(config, req, res);
  };
};
