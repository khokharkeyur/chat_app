import groupRouter from "./groupRoutes.js";
import userRoute from "./userRoutes.js";
import messageRoute from "./messageRoutes.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const authenticatedPaths = [
  "user/register",
  "/user/login",
  "/user/refreshToken",
  "/user/logout",
];

export const setupRoutes = (app) => {
  app.use("/api", (req, res, next) => {
    const isExcludedPath = authenticatedPaths.some((path) => req.path === path);
    if (!isExcludedPath) {
      isAuthenticated(req, res, next);
    } else {
      next();
    }
  });
  app.use("/api/group", groupRouter);
  app.use("/api/user", userRoute);
  app.use("/api/message", messageRoute);
};
