const express = require("express");
const authRoutes = require("./auth.routes");
const adminRoutes = require("./admin.routes");
const mobileRoutes = require("./mobile.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "height-increase-backend",
    time: new Date().toISOString()
  });
});

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/mobile", mobileRoutes);

module.exports = router;
