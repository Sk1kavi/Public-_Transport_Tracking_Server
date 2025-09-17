const express = require("express");
const router = express.Router();
const {getBusById,getBuses,subscribeBus,updateBusLocation,getBusesByRoute} = require("../controllers/busController");

router.get("/buses", getBuses);
router.get("/:busId", getBusById);
router.post("/subscribe", subscribeBus);
router.put("/location", updateBusLocation);
router.get("/buses/by-route", getBusesByRoute);

module.exports = router;
