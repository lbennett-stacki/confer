import { type NextApiRequest, type NextApiResponse } from "next";
import cookie from "cookie";
import signature from "cookie-signature";
import { nanoid } from "nanoid";
import Account from "@mdrxtech/confer-oidc-provider/support/account";
import { provider } from "~/utils/provider";

export const interactionCookie = "ConferInteraction";
export const interactionCookieSecret = "secrets";

export default async function signInInteractionHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("\n\n?. LOGIN INTERACTION HANDLER\n\n");

  const cookies = cookie.parse(req.headers.cookie || "");

  if (!cookies[interactionCookie]) {
    console.log("\n\n2. REDIRECT TO SIGN IN PAGE\n\n");

    res.setHeader(
      "Set-Cookie",
      cookie.serialize(
        interactionCookie,
        signature.sign(nanoid(), interactionCookieSecret),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV !== "development",
          maxAge: 60 * 10, // 10 minutes
          sameSite: "strict",
          path: "/",
        }
      )
    );

    res.redirect(307, `/confer/sign-in/${req.query.id}`);

    return;
  }

  console.log("\n\n3. CHECK INTERACTION\n\n");

  const interaction = await provider.interactionDetails(req, res);

  console.log("interaction", interaction);

  if (interaction.prompt.name !== "login") {
    throw new Error("UNAUTHORIZED");
  }

  const account = await Account.findByLogin(req.body.id);

  const result = {
    login: {
      accountId: account.id,
    },
  };

  console.log("result", result);

  return provider.interactionFinished(req, res, result, {
    mergeWithLastSubmission: false,
  });

  // console.log("set cookie");

  // res.setHeader(
  //   "Set-Cookie",
  //   cookie.serialize(
  //     interactionCookie,
  //     signature.sign("REVOKED", interactionCookieSecret),
  //     {
  //       httpOnly: true,
  //       secure: process.env.NODE_ENV !== "development",
  //       expires: new Date(0),
  //       sameSite: "strict",
  //       path: "/",
  //     }
  //   )
  // );

  // console.log("set cookie!", redirectTo);

  // res.redirect(307, redirectTo);
}
