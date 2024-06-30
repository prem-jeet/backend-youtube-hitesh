import { Router } from "express";
import registerUser from "../controllers/user.controller.js";
import multerUpload from "../middleweres/multer.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(
    multerUpload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },{
            name: "coverImage",
            maxcount: 1,
        }
    ])
    ,registerUser);

export default userRouter;
