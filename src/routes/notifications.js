import express from "express";
const router = express.Router();

// Example: in real system, replace with MongoDB model
let notifications = [
  {
    id: 1,
    title: "Voting Started",
    message: "The presidential voting has officially started.",
    type: "info",
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: 2,
    title: "Vote Recorded",
    message: "Your vote has been successfully submitted.",
    type: "success",
    timestamp: new Date().toISOString(),
    read: false,
  },
];

// GET all notifications
router.get("/", (req, res) => {
  res.json(notifications);
});

// POST add a new notification
router.post("/", (req, res) => {
  const { title, message, type } = req.body;
  const newNotif = {
    id: notifications.length + 1,
    title,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false,
  };
  notifications.push(newNotif);
  res.status(201).json(newNotif);
});

// PATCH mark a notification as read
router.patch("/:id/read", (req, res) => {
  const { id } = req.params;
  const notif = notifications.find(n => n.id == id);
  if (!notif) {
    return res.status(404).json({ error: "Notification not found" });
  }
  notif.read = true;
  res.json(notif);
});

// DELETE clear all notifications
router.delete("/", (req, res) => {
  notifications = [];
  res.json({ message: "All notifications cleared" });
});

export default router;
