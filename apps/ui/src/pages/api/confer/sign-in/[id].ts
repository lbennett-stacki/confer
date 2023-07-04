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
  const cookies = cookie.parse(req.headers.cookie || "");

  if (!cookies[interactionCookie]) {
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

  const interaction = await provider.interactionDetails(req, res);

  if (interaction.prompt.name !== "login") {
    throw new Error("UNAUTHORIZED");
  }

  const account = await Account.findByLogin(req.body.id);

  const result = {
    login: {
      accountId: account.id,
    },
  };

  const redirectTo = await provider.interactionResult(req, res, result, {
    mergeWithLastSubmission: false,
  });

  res.setHeader(
    "Set-Cookie",
    cookie.serialize(
      interactionCookie,
      signature.sign("REVOKED", interactionCookieSecret),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        expires: new Date(0),
        sameSite: "strict",
        path: "/",
      }
    )
  );

  res.status(200).json({ redirectTo });
}
