import express from "express";

import authRoute from "../route/auth.route.js";
import userRoute from "../route/user.route.js";
import companyRoute from "../route/company.route.js";
import loadRoute from "../route/load.route.js";
import paymentRoute from "../route/payment.route.js";

const router = express.Router();

// Mounting the routes
router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/company", companyRoute);
router.use("/load", loadRoute);
router.use("/payment", paymentRoute);

export default router;
