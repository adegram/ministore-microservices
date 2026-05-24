require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const notifications = [];

app.get("/health", (req, res) => {
  res.json({ service: "notification-service", status: "healthy" });
});

app.get("/notifications", (req, res) => {
  res.json({ count: notifications.length, notifications });
});

app.post("/notifications", (req, res) => {
  const { type, message, orderId } = req.body;

  if (!type || !message) {
    return res.status(400).json({
      error: "invalid-notification",
      message: "type and message are required"
    });
  }

  const notification = {
    id: `note-${Date.now()}`,
    type,
    message,
    orderId: orderId || null,
    createdAt: new Date().toISOString()
  };

  notifications.push(notification);
  console.log("Notification created:", notification);

  res.status(201).json(notification);
});

app.listen(PORT, () => {
  console.log(`Notification service listening on port ${PORT}`);
});
