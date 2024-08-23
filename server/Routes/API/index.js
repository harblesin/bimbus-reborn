const router = require("express").Router();
const botRoutes = require("./botRoutes");

router.use("/bot", botRoutes);


module.exports = router;