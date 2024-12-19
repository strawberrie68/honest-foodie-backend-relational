const express = require("express");
const RecipeService = require("../services/recipe.service");

const router = express.Router();
const recipeService = new RecipeService();

// Get recipe feed
router.get("/feed", async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;
    const feed = await recipeService.getRecipeFeed({ cursor, limit });
    res.json(feed);
  } catch (error) {
    next(error);
  }
});

// Search user's recipes
router.get("/user/:userId/search", async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const { q: query, page, limit, sortBy, sortOrder } = req.query;

    const results = await recipeService.searchUserRecipes({
      userId,
      query,
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder,
    });

    res.json(results);
  } catch (error) {
    next(error);
  }
});

router.get("/search/category", async (req, res, next) => {
  try {
    const { category, page, limit, sortBy, sortOrder } = req.query;

    const results = await recipeService.searchRecipesCategory({
      category,
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder,
    });

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Search all recipes
router.get("/search", async (req, res, next) => {
  try {
    const { query, page, limit, sortBy, sortOrder } = req.query;

    const results = await recipeService.searchRecipes({
      query,
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder,
    });

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Create a new recipe
router.post("/", async (req, res, next) => {
  try {
    const recipe = await recipeService.createRecipe(req.body.recipeData);
    res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
});

// Create a review for a recipe
router.post("/:id/reviews", async (req, res, next) => {
  console.log("the body sent for review post", req.body);
  try {
    const recipeId = Number(req.params.id);
    const userId = req.body.userId; // Assuming user ID is provided in the request body
    const reviewData = {
      reviewText: req.body.reviewText,
      rating: Number(req.body.rating),
      imageUrl: req.body.imageUrl,
    };
    console.log(reviewData);

    const review = await recipeService.createReview(
      recipeId,
      userId,
      reviewData
    );
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
});

// Get recipe by ID
router.get("/:id", async (req, res, next) => {
  try {
    const recipe = await recipeService.getRecipeById(Number(req.params.id));
    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

// Update a recipe
router.put("/:id", async (req, res, next) => {
  try {
    const recipe = await recipeService.updateRecipe(
      Number(req.params.id),
      req.body
    );
    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

// Delete a recipe
router.delete("/:id", async (req, res, next) => {
  try {
    await recipeService.deleteRecipe(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
