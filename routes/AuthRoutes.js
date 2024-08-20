import { Router } from "express";
import { checkUser, getAllUsers, getUser, onBoardingUser } from "../controller/AuthController.js";

const authRouter = Router();

authRouter.post("/check-user", checkUser);
authRouter.post("/onboard-user", onBoardingUser );

authRouter.get("/get-user", getUser);
authRouter.get("/get-contacts", getAllUsers);
// authRouter.put("/update", updateUser);

export default authRouter