require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const prisma = new PrismaClient();
const app = express();

const PORT = process.env.PORT || 3003;

const recipeController = require("./src/controllers/recipe.controller.js");
const userController = require("./src/controllers/user.controller.js");
const errorHandler = require("./src/middleware/error.middleware.js");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/recipes", recipeController);
app.use("/api/users", userController);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
