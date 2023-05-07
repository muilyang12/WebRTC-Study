import { Router } from "express";

const roomController = require("../controllers/roomController");
const { createRoom, readRooms, updateRoom, deleteRoom } = roomController;

const router = Router();

router.post("/rooms", createRoom);
router.get("/rooms", readRooms);
router.patch("/rooms/:room_id", updateRoom);
router.delete("/rooms/:room_id", deleteRoom);

module.exports = router;
