const express = require("express");
const router = express.Router();
const {getBusById,getBuses,subscribeBus,updateBusLocation} = require("../controllers/busController");

router.get("/buses", getBuses);
router.get("/:busId", getBusById);
router.post("/subscribe", subscribeBus);
router.put("/location", updateBusLocation);

module.exports = router;
