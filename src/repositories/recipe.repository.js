const ingredientCategories = require("../shared/ingredientCategories");
const BaseRepository = require("./base.repository");
const prisma = require("../config/prisma");

class RecipeRepository extends BaseRepository {
  constructor() {
    super(prisma.recipe);
  }

  async findRecipeWithDetails(id) {
    return prisma.recipe.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            ingredients: true,
          },
        },
        steps: {
          orderBy: {
            orderNumber: "asc",
          },
        },
        user: true,
        reviews: true,
        comments: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async searchUserRecipes({
    userId,
    query,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  }) {
    const skip = (page - 1) * limit;

    // Build search conditions
    const whereConditions = {
      userId, // Filter by user
      OR: [],
    };

    if (query) {
      whereConditions.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        {
          sections: {
            some: {
              ingredients: {
                some: {
                  name: { contains: query, mode: "insensitive" },
                },
              },
            },
          },
        },
        {
          tags: {
            some: {
              tag: {
                name: { contains: query, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    // If no query provided, remove OR condition
    if (!query) {
      delete whereConditions.OR;
    }

    // Handle sorting by rating
    const orderBy =
      sortBy === "rating"
        ? {
            reviews: {
              _avg: {
                rating: sortOrder,
              },
            },
          }
        : { [sortBy]: sortOrder };

    // Execute search query with pagination
    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where: whereConditions,
        include: {
          sections: {
            include: {
              ingredients: true,
            },
          },
          steps: {
            orderBy: {
              orderNumber: "asc",
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              comments: true,
            },
          },
        },
        orderBy: orderBy,
        skip,
        take: limit,
      }),
      prisma.recipe.count({
        where: whereConditions,
      }),
    ]);

    // Calculate average rating for each recipe
    const recipesWithAvgRating = recipes.map((recipe) => {
      const avgRating =
        recipe.reviews.length > 0
          ? recipe.reviews.reduce((sum, review) => sum + review.rating, 0) /
            recipe.reviews.length
          : 0;
      return {
        ...recipe,
        avgRating,
      };
    });

    return {
      recipes: recipesWithAvgRating,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  async searchRecipesByQuery({
    query,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  }) {
    const skip = (page - 1) * limit;

    // Only add search conditions if a query is provided
    const whereConditions = query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            {
              sections: {
                some: {
                  ingredients: {
                    some: {
                      name: { contains: query, mode: "insensitive" },
                    },
                  },
                },
              },
            },
            {
              tags: {
                some: {
                  tag: {
                    name: { contains: query, mode: "insensitive" },
                  },
                },
              },
            },
          ],
        }
      : {};

    return await this.performRecipeSearch(
      whereConditions,
      page,
      limit,
      sortBy,
      sortOrder
    );
  }

  // Category-based search method
  async searchRecipesByCategory({
    category,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  }) {
    const categoryIngredients = ingredientCategories[category] || [];

    const whereConditions = {
      sections: {
        some: {
          ingredients: {
            some: {
              name: {
                in: categoryIngredients,
                mode: "insensitive",
              },
            },
          },
        },
      },
    };

    return await this.performRecipeSearch(
      whereConditions,
      page,
      limit,
      sortBy,
      sortOrder
    );
  }

  // Shared search implementation
  async performRecipeSearch(whereConditions, page, limit, sortBy, sortOrder) {
    const skip = (page - 1) * limit;

    // Handle sorting by rating
    const orderBy =
      sortBy === "rating"
        ? {
            reviews: {
              _avg: {
                rating: sortOrder,
              },
            },
          }
        : { [sortBy]: sortOrder };

    // Execute search query with pagination
    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where: whereConditions,
        include: {
          sections: {
            include: {
              ingredients: true,
            },
          },
          steps: {
            orderBy: {
              orderNumber: "asc",
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              profilePicture: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              comments: true,
            },
          },
        },
        orderBy: orderBy,
        skip,
        take: limit,
      }),
      prisma.recipe.count({
        where: whereConditions,
      }),
    ]);

    // Calculate average rating for each recipe
    const recipesWithAvgRating = recipes.map((recipe) => {
      const avgRating =
        recipe.reviews.length > 0
          ? recipe.reviews.reduce((sum, review) => sum + review.rating, 0) /
            recipe.reviews.length
          : 0;
      return {
        ...recipe,
        avgRating,
      };
    });

    return {
      recipes: recipesWithAvgRating,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  async getRecipeFeed({ cursor, limit = 10 }) {
    return prisma.recipe.findMany({
      take: limit,
      skip: cursor ? 1 : 0, // Skip the cursor if provided
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc", // Most recent first
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        sections: {
          include: {
            ingredients: true,
          },
        },
        steps: {
          orderBy: {
            orderNumber: "asc",
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
  }

  async createRecipeWithSteps(recipeData, steps) {
    return prisma.$transaction(async (prisma) => {
      const recipe = await prisma.recipe.create({
        data: {
          ...recipeData,
          steps: {
            create: steps.map((step, index) => ({
              orderNumber: index + 1,
              instruction: step.instruction,
            })),
          },
        },
        include: {
          steps: true,
          sections: {
            include: {
              ingredients: true,
            },
          },
        },
      });
      return recipe;
    });
  }

  async updateRecipeSteps(recipeId, steps) {
    return prisma.$transaction(async (prisma) => {
      // Delete existing steps
      await prisma.step.deleteMany({
        where: { recipeId },
      });

      // Create new steps
      const recipe = await prisma.recipe.update({
        where: { id: recipeId },
        data: {
          steps: {
            create: steps.map((step, index) => ({
              orderNumber: index + 1,
              instruction: step.instruction,
            })),
          },
        },
        include: {
          steps: {
            orderBy: {
              orderNumber: "asc",
            },
          },
        },
      });
      return recipe;
    });
  }
}

module.exports = RecipeRepository;
