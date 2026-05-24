require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const products = [
  {
    id: "prod-001",
    name: "Cloud Engineer Hoodie",
    price: 45,
    stock: 25,
    category: "apparel"
  },
  {
    id: "prod-002",
    name: "Kubernetes Coffee Mug",
    price: 18,
    stock: 60,
    category: "accessories"
  },
  {
    id: "prod-003",
    name: "DevOps Notebook",
    price: 12,
    stock: 100,
    category: "stationery"
  }
];

app.get("/health", (req, res) => {
  res.json({ service: "product-service", status: "healthy" });
});

app.get("/products", (req, res) => {
  res.json({ count: products.length, products });
});

app.get("/products/:id", (req, res) => {
  const product = products.find(item => item.id === req.params.id);

  if (!product) {
    return res.status(404).json({
      error: "product-not-found",
      message: `No product exists with id ${req.params.id}`
    });
  }

  res.json(product);
});

app.listen(PORT, () => {
  console.log(`Product service listening on port ${PORT}`);
});
