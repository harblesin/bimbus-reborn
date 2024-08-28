import Router from "express";
import botRoutes from "./botRoutes";

const router = Router();

router.use("/bot", botRoutes);

export default router;