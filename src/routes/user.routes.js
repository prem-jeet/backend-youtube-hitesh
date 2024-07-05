import { Router } from "express";
import { registerUser, logoutUser, loginUser, refreshAccessToken } from "../controllers/user.controller.js";
import multerUpload from "../middleweres/multer.middleware.js";
import { verifyJWT } from "../middleweres/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(
  multerUpload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxcount: 1,
    },
  ]),
  registerUser
);

userRouter.route("/login").post(loginUser);

// secured routes
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/refreshAccessToken").post(refreshAccessToken)
export default userRouter;
