import { type NextApiRequest, type NextApiResponse } from "next";
import { providerMiddleware } from "~/utils/provider";

export default async function oidcHandler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  return providerMiddleware(request, response);
}
