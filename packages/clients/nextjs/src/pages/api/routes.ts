import { NextApiRequest, NextApiResponse } from "next";
import { ConferMeRoute, ConferMeConfig } from "./me";
import { ConferRedirectRoute, ConferRedirectConfig } from "./redirect";
import { ConferSignInRoute, ConferSignInConfig } from "./sign-in";

export interface ConferConfig
  extends ConferSignInConfig,
    ConferRedirectConfig,
    ConferMeConfig {}

export const ConferRoutes = (config: ConferConfig) => {
  const signIn = ConferSignInRoute(config);
  const redirect = ConferRedirectRoute(config);
  const me = ConferMeRoute(config);

  return (req: NextApiRequest, res: NextApiResponse) => {
    const url = new URL(req.url || "");

    if (url.pathname.endsWith("/sign-in")) {
      return signIn(req, res);
    } else if (url.pathname.endsWith("/redirect")) {
      return redirect(req, res);
    } else if (url.pathname.endsWith("/me")) {
      return me(req, res);
    }
  };
};
