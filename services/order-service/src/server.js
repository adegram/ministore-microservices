require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const morgan = require("morgan");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3002;

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:3001";
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3003";

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const orders = [];

app.get("/health", (req, res) => {
  res.json({
    service: "order-service",
    status: "healthy",
    dependencies: {
      productService: PRODUCT_SERVICE_URL,
      notificationService: NOTIFICATION_SERVICE_URL
    }
  });
});

app.get("/orders", (req, res) => {
  res.json({ count: orders.length, orders });
});

app.post("/orders", async (req, res) => {
  try {
    const { productId, quantity, customerName } = req.body;

    if (!productId || !quantity || !customerName) {
      return res.status(400).json({
        error: "invalid-order",
        message: "productId, quantity, and customerName are required"
      });
    }

    const productResponse = await axios.get(`${PRODUCT_SERVICE_URL}/products/${productId}`);
    const product = productResponse.data;

    if (quantity > product.stock) {
      return res.status(400).json({
        error: "insufficient-stock",
        message: `Only ${product.stock} units are available for ${product.name}`
      });
    }

    const order = {
      id: crypto.randomUUID(),
      customerName,
      productId,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      totalPrice: product.price * quantity,
      status: "created",
      createdAt: new Date().toISOString()
    };

    orders.push(order);

    try {
      await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications`, {
        type: "order.created",
        orderId: order.id,
        message: `New order created for ${customerName}: ${quantity} x ${product.name}`
      });
    } catch (notificationError) {
      console.warn("Order was created but notification failed:", notificationError.message);
    }

    res.status(201).json(order);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }

    console.error(err.message);
    res.status(500).json({
      error: "order-service-error",
      message: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Order service listening on port ${PORT}`);
});
