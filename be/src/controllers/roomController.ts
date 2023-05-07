import { Request, Response, NextFunction } from "express";

const { Room } = require("../models");

const createRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { room_name } = req.body;

    const existingRoom = await Room.findOne({ where: { room_name } });
    if (existingRoom) {
      return res.status(409).json({ message: "Room already exists" });
    }

    const room = await Room.create({ room_name });

    res.status(201).json({ message: "Room created successfully", room });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating room" });
  }
};

const readRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rooms = await Room.findAll();

    res.status(200).json({ rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving rooms" });
  }
};

const updateRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { room_id } = req.params;
    const { room_name } = req.body;

    const room = await Room.findOne({ where: { id: room_id } });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    await room.update({ room_name });

    res.status(200).json({ message: "Room updated successfully", room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating room" });
  }
};

const deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { room_id } = req.params;

    const room = await Room.findOne({ where: { id: room_id } });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    await room.destroy();

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting room" });
  }
};

module.exports = {
  createRoom,
  readRooms,
  updateRoom,
  deleteRoom,
};
