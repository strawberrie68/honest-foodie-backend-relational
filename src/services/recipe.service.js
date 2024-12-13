const RecipeRepository = require("../repositories/recipe.repository");

class RecipeService {
  constructor() {
    this.recipeRepository = new RecipeRepository();
  }

  async createRecipe(data) {
    // Validate recipe data including new fields
    this.validateRecipeData(data);

    // Separate steps and sections from main recipe data
    const { steps, sections, ...recipeData } = data;

    // Create recipe with steps and sections using the new method
    return this.recipeRepository.createRecipeWithSteps(
      recipeData,
      steps || [],
      sections || []
    );
  }

  async getRecipeById(id) {
    const recipe = await this.recipeRepository.findRecipeWithDetails(id);
    if (!recipe) {
      throw new Error("Recipe not found");
    }
    return recipe;
  }

  async searchUserRecipes({
    userId,
    query,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  }) {
    if (!userId) {
      throw new Error("User ID is required for searching user recipes");
    }

    // Validate pagination parameters
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = this.validateAndParseLimit(limit);

    // Validate sort parameters
    const allowedSortFields = ["createdAt", "title", "rating"];
    const allowedSortOrders = ["asc", "desc"];

    const validatedSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const validatedSortOrder = allowedSortOrders.includes(sortOrder)
      ? sortOrder
      : "desc";

    return this.recipeRepository.searchUserRecipes({
      userId,
      query,
      page: validatedPage,
      limit: validatedLimit,
      sortBy: validatedSortBy,
      sortOrder: validatedSortOrder,
    });
  }
  async searchRecipesCategory({
    category,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  }) {
    // Validate pagination parameters
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = this.validateAndParseLimit(limit);

    // Validate sort parameters
    const allowedSortFields = ["createdAt", "title", "rating"];
    const allowedSortOrders = ["asc", "desc"];

    const validatedSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const validatedSortOrder = allowedSortOrders.includes(sortOrder)
      ? sortOrder
      : "desc";

    return this.recipeRepository.searchRecipesByCategory({
      category,
      page: validatedPage,
      limit: validatedLimit,
      sortBy: validatedSortBy,
      sortOrder: validatedSortOrder,
    });
  }

  async searchRecipes({
    query,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  }) {
    console.log("query sent to the services", query);
    // Validate pagination parameters
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = this.validateAndParseLimit(limit);

    // Validate sort parameters
    const allowedSortFields = ["createdAt", "title", "rating"];
    const allowedSortOrders = ["asc", "desc"];

    const validatedSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const validatedSortOrder = allowedSortOrders.includes(sortOrder)
      ? sortOrder
      : "desc";

    return this.recipeRepository.searchRecipesByQuery({
      query,
      page: validatedPage,
      limit: validatedLimit,
      sortBy: validatedSortBy,
      sortOrder: validatedSortOrder,
    });
  }

  async updateRecipe(id, data) {
    // Validate recipe data including new fields
    this.validateRecipeData(data);

    // Separate steps from main recipe data
    const { steps, ...recipeData } = data;

    // Update main recipe data
    await this.recipeRepository.update(id, recipeData);

    // If steps are provided, update them
    if (steps) {
      await this.recipeRepository.updateRecipeSteps(id, steps);
    }

    // Return updated recipe with all details
    return this.getRecipeById(id);
  }

  async deleteRecipe(id) {
    return this.recipeRepository.delete(id);
  }

  async getRecipeFeed({ cursor, limit }) {
    // Validate limit
    const validatedLimit = this.validateAndParseLimit(limit);

    try {
      const recipes = await this.recipeRepository.getRecipeFeed({
        cursor,
        limit: validatedLimit,
      });

      // Get the last item's id for next cursor
      const lastRecipe = recipes[recipes.length - 1];
      const nextCursor = lastRecipe ? lastRecipe.id : null;

      return {
        recipes,
        nextCursor,
        hasMore: recipes.length === validatedLimit,
      };
    } catch (error) {
      throw new Error(`Failed to fetch recipe feed: ${error.message}`);
    }
  }

  validateRecipeData(data) {
    console.log("validate data sent: ", data);
    if (!data.description) {
      throw new Error("Recipe description is required");
    }

    if (!data.title) {
      throw new Error("Recipe title is required");
    }

    // Validate preparation time
    if (data.preparationTime !== undefined) {
      const prepTime = parseInt(data.preparationTime);
      if (isNaN(prepTime) || prepTime < 0) {
        throw new Error("Preparation time must be a positive number");
      }
    }

    // Validate cooking time
    if (data.cookingTime !== undefined) {
      const cookTime = parseInt(data.cookingTime);
      if (isNaN(cookTime) || cookTime < 0) {
        throw new Error("Cooking time must be a positive number");
      }
    }

    // Validate servings
    if (data.servings !== undefined) {
      const servings = parseInt(data.servings);
      if (isNaN(servings) || servings <= 0) {
        throw new Error("Servings must be a positive number");
      }
    }

    // Validate steps if provided
    if (data.steps) {
      if (!Array.isArray(data.steps)) {
        throw new Error("Steps must be an array");
      }

      data.steps.forEach((step, index) => {
        if (
          !step.instruction ||
          typeof step.instruction !== "string" ||
          step.instruction.trim().length === 0
        ) {
          throw new Error(`Step ${index + 1} must have a valid instruction`);
        }
      });
    }

    // Validate sections if provided
    if (data.sections) {
      if (!Array.isArray(data.sections)) {
        throw new Error("Sections must be an array");
      }

      data.sections.forEach((section, sectionIndex) => {
        if (
          !section.name ||
          typeof section.name !== "string" ||
          section.name.trim().length === 0
        ) {
          throw new Error(`Section ${sectionIndex + 1} must have a valid name`);
        }

        if (!Array.isArray(section.ingredients)) {
          throw new Error(
            `Section ${sectionIndex + 1} must have an ingredients array`
          );
        }

        section.ingredients.forEach((ingredient, ingredientIndex) => {
          if (
            !ingredient.ingredient ||
            typeof ingredient.ingredient !== "string" ||
            ingredient.ingredient.trim().length === 0
          ) {
            throw new Error(
              `Ingredient ${ingredientIndex + 1} in section ${
                sectionIndex + 1
              } must have a valid name`
            );
          }

          if (
            ingredient.amount !== undefined &&
            (isNaN(ingredient.amount) || ingredient.amount <= 0)
          ) {
            throw new Error(
              `Ingredient ${ingredientIndex + 1} in section ${
                sectionIndex + 1
              } must have a valid amount`
            );
          }

          if (ingredient.unit && typeof ingredient.unit !== "string") {
            throw new Error(
              `Ingredient ${ingredientIndex + 1} in section ${
                sectionIndex + 1
              } must have a valid unit`
            );
          }
        });
      });
    }
  }

  validateAndParseLimit(limit) {
    const parsedLimit = parseInt(limit) || 10;
    // Ensure limit is between 1 and 50
    return Math.min(Math.max(parsedLimit, 1), 50);
  }
}

module.exports = RecipeService;
