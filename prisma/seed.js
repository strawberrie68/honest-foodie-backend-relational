const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Clear existing data to avoid conflicts
  await prisma.recipeTags.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.userLikes.deleteMany();
  await prisma.userFavorites.deleteMany();
  await prisma.userFollows.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.step.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.section.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.user.deleteMany();

  // Create test user for easy login
  const testUserPassword = await bcrypt.hash("test123", 10);
  const testUser = await prisma.user.create({
    data: {
      username: "testuser",
      email: "test@example.com",
      password: testUserPassword,
      profilePicture:
        "https://plus.unsplash.com/premium_photo-1722859221349-26353eae4744?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZG9nfGVufDB8fDB8fHww",
      bio: "This is a test account for trying out the app",
    },
  });

  // Create Users
  const hashedPassword = await bcrypt.hash("password123", 10);
  const users = await prisma.user.createMany({
    data: [
      {
        username: "johndoe",
        email: "john@example.com",
        password: hashedPassword,
        profilePicture:
          "https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
        bio: "Passionate home cook and food enthusiast",
      },
      {
        username: "janedoe",
        email: "jane@example.com",
        password: hashedPassword,
        profilePicture:
          "https://plus.unsplash.com/premium_photo-1689977807477-a579eda91fa2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjF8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
        bio: "Professional chef and recipe creator",
      },
      {
        username: "cookmaster",
        email: "master@example.com",
        password: hashedPassword,
        profilePicture:
          "https://plus.unsplash.com/premium_photo-1670884442192-7b58d513cd55?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
        bio: "Culinary expert with 20 years of experience",
      },
    ],
  });

  // Fetch created users to get their IDs
  const createdUsers = await prisma.user.findMany();
  const johnDoe = createdUsers.find((u) => u.username === "johndoe");
  const janeDoe = createdUsers.find((u) => u.username === "janedoe");
  const cookMaster = createdUsers.find((u) => u.username === "cookmaster");

  // Create Tags
  const tags = await prisma.tag.createMany({
    data: [
      { name: "Breakfast" },
      { name: "Dinner" },
      { name: "Vegetarian" },
      { name: "Vegan" },
      { name: "Dessert" },
      { name: "Quick Meal" },
      { name: "Healthy" },
    ],
  });

  // Fetch created tags
  const createdTags = await prisma.tag.findMany();

  // Create Recipes with Sections, Ingredients, and Steps
  const recipes = [
    {
      userId: johnDoe.id,
      title: "Chocolate Chip cookie",
      description: "Classic Chocolate Chip Cookies",
      imageUrl:
        "https://plus.unsplash.com/premium_photo-1670895802275-ed748ced4309?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Y29va2llc3xlbnwwfHwwfHx8MA%3D%3D",
      preparationTime: 20,
      cookingTime: 12,
      servings: 24,
      tags: ["Dessert"],
      sections: [
        {
          name: "Dry Ingredients",
          ingredients: [
            { name: "All-purpose flour", quantity: 2.25, unit: "cups" },
            { name: "Baking soda", quantity: 1, unit: "tsp" },
            { name: "Salt", quantity: 0.5, unit: "tsp" },
          ],
        },
        {
          name: "Wet Ingredients",
          ingredients: [
            { name: "Butter", quantity: 1, unit: "cup" },
            { name: "White sugar", quantity: 0.75, unit: "cup" },
            { name: "Brown sugar", quantity: 0.75, unit: "cup" },
            { name: "Eggs", quantity: 2, unit: "whole" },
            { name: "Vanilla extract", quantity: 2, unit: "tsp" },
          ],
        },
        {
          name: "Mix-ins",
          ingredients: [{ name: "Chocolate chips", quantity: 2, unit: "cups" }],
        },
      ],
      steps: [
        {
          instruction:
            "Preheat oven to 375°F (190°C). Line baking sheets with parchment paper.",
        },
        {
          instruction:
            "In a medium bowl, whisk together flour, baking soda, and salt. Set aside.",
        },
        {
          instruction:
            "In a large bowl, cream together butter, white sugar, and brown sugar until smooth.",
        },
        {
          instruction:
            "Beat in eggs one at a time, then stir in vanilla extract.",
        },
        { instruction: "Gradually blend in the dry ingredients." },
        { instruction: "Stir in chocolate chips." },
        {
          instruction:
            "Drop rounded tablespoons of dough onto prepared baking sheets.",
        },
        {
          instruction:
            "Bake for 10 to 12 minutes or until edges are lightly browned.",
        },
        {
          instruction:
            "Let cool on baking sheets for 5 minutes before transferring to wire racks.",
        },
      ],
    },
    {
      userId: janeDoe.id,
      title: "Tofu Stir-fry",
      description: "Veggie Stir Fry",
      imageUrl:
        "https://plus.unsplash.com/premium_photo-1664475934279-2631a25c42ce?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3RpcmZyeXxlbnwwfHwwfHx8MA%3D%3D",
      preparationTime: 15,
      cookingTime: 20,
      servings: 4,
      tags: ["Dinner", "Vegetarian", "Healthy"],
      sections: [
        {
          name: "Vegetables",
          ingredients: [
            { name: "Bell peppers", quantity: 2, unit: "whole" },
            { name: "Broccoli", quantity: 1, unit: "cup" },
            { name: "Carrots", quantity: 2, unit: "whole" },
          ],
        },
        {
          name: "Sauce",
          ingredients: [
            { name: "Soy sauce", quantity: 0.25, unit: "cup" },
            { name: "Sesame oil", quantity: 2, unit: "tbsp" },
            { name: "Garlic", quantity: 3, unit: "cloves" },
          ],
        },
      ],
      steps: [
        {
          instruction:
            "Press tofu for 30 minutes to remove excess moisture, then cut into 1-inch cubes.",
        },
        { instruction: "Chop all vegetables into bite-sized pieces." },
        { instruction: "Mix sauce ingredients in a small bowl." },
        {
          instruction:
            "Heat oil in a large wok or skillet over medium-high heat.",
        },
        {
          instruction:
            "Add tofu and cook until golden brown on all sides, about 5-7 minutes.",
        },
        { instruction: "Remove tofu and set aside." },
        {
          instruction:
            "In the same pan, stir-fry vegetables until crisp-tender.",
        },
        { instruction: "Return tofu to pan and add sauce." },
        {
          instruction:
            "Cook for additional 2-3 minutes until everything is well coated and heated through.",
        },
        { instruction: "Serve hot over rice or noodles." },
      ],
    },
  ];

  // Create Recipes with Sections, Ingredients, and Steps
  for (const recipeData of recipes) {
    const { tags, sections, steps, ...recipeInput } = recipeData;

    const recipe = await prisma.recipe.create({
      data: {
        ...recipeInput,
        sections: {
          create: sections.map((section) => ({
            name: section.name,
            ingredients: {
              create: section.ingredients,
            },
          })),
        },
        steps: {
          create: steps.map((step, index) => ({
            orderNumber: index + 1,
            instruction: step.instruction,
          })),
        },
      },
    });

    // Add tags to recipe
    for (const tagName of tags) {
      const tag = createdTags.find((t) => t.name === tagName);
      if (tag) {
        await prisma.recipeTags.create({
          data: {
            recipeId: recipe.id,
            tagId: tag.id,
          },
        });
      }
    }

    // Create some reviews
    await prisma.review.createMany({
      data: [
        {
          recipeId: recipe.id,
          userId: cookMaster.id,
          reviewText: "Amazing recipe! Loved every bite.",
          rating: 5.0,
          imageUrl:
            "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29va2luZ3xlbnwwfHwwfHx8MA%3D%3D",
        },
        {
          recipeId: recipe.id,
          userId: johnDoe.id,
          reviewText: "Pretty good, but could use some tweaks.",
          rating: 4.0,
          imageUrl:
            "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29va2luZ3xlbnwwfHwwfHx8MA%3D%3D",
        },
      ],
    });

    // Create some comments
    await prisma.comment.createMany({
      data: [
        {
          recipeId: recipe.id,
          userId: janeDoe.id,
          text: "Great recipe! Thanks for sharing.",
        },
        {
          recipeId: recipe.id,
          userId: cookMaster.id,
          text: "I added some extra spices to make it more flavorful.",
        },
      ],
    });
  }

  // Create some user follows
  await prisma.userFollows.createMany({
    data: [
      { followerId: johnDoe.id, followingId: janeDoe.id },
      { followerId: janeDoe.id, followingId: cookMaster.id },
      { followerId: cookMaster.id, followingId: johnDoe.id },
    ],
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
