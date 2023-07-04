/* eslint-disable no-console */

import path from "path";
import { promisify } from "util";

import { dirname } from "desm";
import render from "@koa/ejs";
import helmet from "helmet";
import { provider } from "./provider.js";

import routes from "./routes/koa.js";

const __dirname = dirname(import.meta.url);

const { PORT = 3000, ISSUER = `http://localhost:${PORT}` } = process.env;

let server;

const prod = process.env.NODE_ENV === "production";

try {
  const directives = helmet.contentSecurityPolicy.getDefaultDirectives();
  delete directives["form-action"];
  const pHelmet = promisify(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives,
      },
    })
  );

  provider.use(async (ctx, next) => {
    const origSecure = ctx.req.secure;
    ctx.req.secure = ctx.request.secure;
    await pHelmet(ctx.req, ctx.res);
    ctx.req.secure = origSecure;
    return next();
  });

  if (prod) {
    provider.proxy = true;
    provider.use(async (ctx, next) => {
      if (ctx.secure) {
        await next();
      } else if (ctx.method === "GET" || ctx.method === "HEAD") {
        ctx.status = 303;
        ctx.redirect(ctx.href.replace(/^http:\/\//i, "https://"));
      } else {
        ctx.body = {
          error: "invalid_request",
          error_description: "do yourself a favor and only use https",
        };
        ctx.status = 400;
      }
    });
  }
  render(provider.app, {
    cache: false,
    viewExt: "ejs",
    layout: "_layout",
    root: path.join(__dirname, "../ui/src"),
  });
  provider.use(routes(provider).routes());
  server = provider.listen(PORT, () => {
    console.log(
      `application is listening on port ${PORT}, check its /.well-known/openid-configuration`
    );
  });
} catch (err) {
  if (server?.listening) server.close();
  console.error(err);
  process.exitCode = 1;
}
