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

  async createReview(recipeId, userId, reviewData) {
    return prisma.review.create({
      data: {
        recipeId,
        userId,
        reviewText: reviewData.reviewText,
        rating: reviewData.rating,
        imageUrl: reviewData.imageUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
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

    return await this.performRecipeSearch(
      whereConditions,
      page,
      limit,
      sortBy,
      sortOrder
    );
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

    // First, get recipes with their average ratings
    const recipesWithRatings = await prisma.recipe.findMany({
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
    });

    // Calculate average ratings and sort
    const recipesWithAvgRating = recipesWithRatings.map((recipe) => {
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

    // Sort the results
    if (sortBy === "rating") {
      recipesWithAvgRating.sort((a, b) => {
        return sortOrder === "desc"
          ? b.avgRating - a.avgRating
          : a.avgRating - b.avgRating;
      });
    } else {
      recipesWithAvgRating.sort((a, b) => {
        const valueA = a[sortBy];
        const valueB = b[sortBy];
        if (sortOrder === "desc") {
          return valueA < valueB ? 1 : -1;
        }
        return valueA > valueB ? 1 : -1;
      });
    }

    // Apply pagination
    const paginatedRecipes = recipesWithAvgRating.slice(skip, skip + limit);
    const total = recipesWithAvgRating.length;

    return {
      recipes: paginatedRecipes,
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

  async createRecipeWithSteps(recipeData, steps, sections) {
    return prisma.$transaction(async (prisma) => {
      // First, create or connect tags
      const tagConnections = [];
      if (recipeData.tags && Array.isArray(recipeData.tags)) {
        for (const tagName of recipeData.tags) {
          // Create or find the tag
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          });
          tagConnections.push({ tagId: tag.id });
        }
      }

      // Remove tags from recipeData since we're handling them separately
      const { tags, user, ...recipeDataWithoutTags } = recipeData;

      // Get userId from the user field
      const userId = Number(user);
      if (isNaN(userId)) {
        throw new Error("Invalid user ID provided");
      }

      const recipe = await prisma.recipe.create({
        data: {
          ...recipeDataWithoutTags,
          userId: userId,
          steps: {
            create: steps.map((step, index) => ({
              orderNumber: index + 1,
              instruction: step.instruction,
            })),
          },
          sections: {
            create: sections.map((section) => ({
              name: section.name,
              ingredients: {
                create: section.ingredients.map((ingredient) => ({
                  name: ingredient.ingredient,
                  quantity: Number(ingredient.amount),
                  unit: ingredient.unit,
                })),
              },
            })),
          },
          tags: {
            create: tagConnections,
          },
        },
        include: {
          steps: true,
          sections: {
            include: {
              ingredients: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          user: true,
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
