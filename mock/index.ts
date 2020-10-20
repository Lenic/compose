import Router from "@koa/router";

const mockSetup = () => {
  const router = new Router({ prefix: "/api" });

  return ({ app }) => {
    router.get("/test", (ctx, next) => {
      ctx.body = { c: 200 };
    });

    app.use(router.routes());
  };
};

export default () => ({ configureServer: [mockSetup()] });
