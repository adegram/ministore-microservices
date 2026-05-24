require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 8080;

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:3001";
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://localhost:3002";
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3003";

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

app.get("/", (req, res) => {
  res.json({
    message: "MiniStore API Gateway is running",
    routes: {
      health: "/health",
      products: "/api/products",
      orders: "/api/orders",
      notifications: "/api/notifications"
    }
  });
});

app.get("/health", (req, res) => {
  res.json({
    service: "api-gateway",
    status: "healthy",
    dependencies: {
      productService: PRODUCT_SERVICE_URL,
      orderService: ORDER_SERVICE_URL,
      notificationService: NOTIFICATION_SERVICE_URL
    }
  });
});

app.get("/api/products", asyncHandler(async (req, res) => {
  const response = await axios.get(`${PRODUCT_SERVICE_URL}/products`);
  res.status(response.status).json(response.data);
}));

app.get("/api/products/:id", asyncHandler(async (req, res) => {
  const response = await axios.get(`${PRODUCT_SERVICE_URL}/products/${req.params.id}`);
  res.status(response.status).json(response.data);
}));

app.get("/api/orders", asyncHandler(async (req, res) => {
  const response = await axios.get(`${ORDER_SERVICE_URL}/orders`);
  res.status(response.status).json(response.data);
}));

app.post("/api/orders", asyncHandler(async (req, res) => {
  const response = await axios.post(`${ORDER_SERVICE_URL}/orders`, req.body);
  res.status(response.status).json(response.data);
}));

app.get("/api/notifications", asyncHandler(async (req, res) => {
  const response = await axios.get(`${NOTIFICATION_SERVICE_URL}/notifications`);
  res.status(response.status).json(response.data);
}));

app.use((err, req, res, next) => {
  if (err.response) {
    return res.status(err.response.status).json(err.response.data);
  }

  console.error(err.message);
  res.status(500).json({
    error: "api-gateway-error",
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
