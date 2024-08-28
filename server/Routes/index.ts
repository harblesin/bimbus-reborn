import Router from "express";
import apiRoutes from "./API";
const path = require("path");
const router = Router();
 
router.use("/api", apiRoutes);

router.use( function (req, res) {
    res.sendFile(path.join(__dirname, "../../public/index.html"));
})

export default router;