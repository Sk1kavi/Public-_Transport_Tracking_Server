const express = require("express");
const router = express.Router();
const {getBusById,getBuses,subscribeBus,updateBusLocation,getBusesByRoute,getBusLocation} = require("../controllers/busController");

router.get("/buses", getBuses);
router.get("/:busId", getBusById);
router.post("/subscribe", subscribeBus);
router.put("/location", updateBusLocation);
router.get("/buses/by-route", getBusesByRoute);
router.get("/:busId/location", getBusLocation);

module.exports = router;
