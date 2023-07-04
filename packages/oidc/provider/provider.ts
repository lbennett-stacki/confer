import Provider from "oidc-provider";
// import { promisify } from "util";
// import helmet from "helmet";
import { config } from "./support/configuration";
// import { ServerResponse } from "http";

export const authBaseUrl = "http://localhost:3001";
export const oidcUrl = `${authBaseUrl}/api/oidc`;

const providerFactory = () => new Provider(oidcUrl, config);
// provider.proxy = true;

// const directives = helmet.contentSecurityPolicy.getDefaultDirectives();
// delete directives["form-action"];
// const pHelmet = promisify(
//   helmet({
//     contentSecurityPolicy: {
//       useDefaults: false,
//       directives,
//     },
//   })
// );

// provider.use(async ({ req, res }: { req: any; res: ServerResponse }, next) => {
//   if (req && req.secure !== undefined) {
//     const origSecure = req.secure;
//     req.secure = req.secure;
//     await pHelmet(req, res);
//     req.secure = origSecure;
//   }
//   return next();
// });

export { providerFactory };
