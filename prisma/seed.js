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
      { name: "Quick" },
      { name: "Drinks" },
      { name: "Seasonal" },
      { name: "Winter" },
      { name: "Salad" },
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
    {
      userId: johnDoe.id,
      title: "Egg Toast",
      description: "A quick and healthy breakfast with avocado on toast.",
      imageUrl:
        "https://images.unsplash.com/photo-1617054240991-b0ffce6600da?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZjYWRvJTIwdG9hc3R8ZW58MHx8MHx8fDA%3D",
      preparationTime: 5,
      cookingTime: 2,
      servings: 1,
      tags: ["Breakfast", "Quick", "Healthy"],
      sections: [
        {
          name: "Ingredients",
          ingredients: [
            { name: "Bread", quantity: 1, unit: "slice" },
            { name: "Avocado", quantity: 0.5, unit: "whole" },
            { name: "Salt", quantity: 1, unit: "pinch" },
            { name: "Pepper", quantity: 1, unit: "pinch" },
            { name: "Red chili flakes", quantity: 1, unit: "pinch" },
            { name: "Olive oil", quantity: 1, unit: "tsp" },
          ],
        },
      ],
      steps: [
        {
          instruction: "Toast the bread until golden and crisp.",
        },
        {
          instruction:
            "Mash the avocado in a bowl and season with salt, pepper, and chili flakes.",
        },
        {
          instruction: "Spread the mashed avocado onto the toast.",
        },
        {
          instruction: "Drizzle with olive oil and serve immediately.",
        },
      ],
    },
    {
      userId: janeDoe.id,
      title: "Hot Chocolate",
      description: "A cozy and rich seasonal drink.",
      imageUrl:
        "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aG90JTIwY2hvY29sYXRlfGVufDB8fDB8fHww",
      preparationTime: 5,
      cookingTime: 10,
      servings: 2,
      tags: ["Drinks", "Seasonal", "Winter"],
      sections: [
        {
          name: "Ingredients",
          ingredients: [
            { name: "Milk", quantity: 2, unit: "cups" },
            { name: "Cocoa powder", quantity: 2, unit: "tbsp" },
            { name: "Sugar", quantity: 2, unit: "tbsp" },
            { name: "Dark chocolate", quantity: 0.5, unit: "cup" },
            { name: "Whipped cream", quantity: 1, unit: "optional" },
            { name: "Marshmallows", quantity: 1, unit: "optional" },
          ],
        },
      ],
      steps: [
        {
          instruction:
            "In a saucepan, combine milk, cocoa powder, and sugar over medium heat.",
        },
        {
          instruction: "Whisk constantly until cocoa powder is dissolved.",
        },
        {
          instruction: "Add dark chocolate and stir until melted and smooth.",
        },
        {
          instruction:
            "Pour into mugs and top with whipped cream or marshmallows if desired.",
        },
      ],
    },
    {
      userId: johnDoe.id,
      title: "Apple Cider",
      description: "Warm apple cider with seasonal spices.",
      imageUrl:
        "https://images.unsplash.com/photo-1575549592564-4d50aa43b3af?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBwbGUlMjBjaWRlcnxlbnwwfHwwfHx8MA%3D%3D",
      preparationTime: 10,
      cookingTime: 15,
      servings: 4,
      tags: ["Drinks", "Seasonal", "Fall"],
      sections: [
        {
          name: "Ingredients",
          ingredients: [
            { name: "Apple cider", quantity: 4, unit: "cups" },
            { name: "Cinnamon stick", quantity: 1, unit: "whole" },
            { name: "Cloves", quantity: 5, unit: "whole" },
            { name: "Orange peel", quantity: 1, unit: "strip" },
            { name: "Star anise", quantity: 2, unit: "whole" },
          ],
        },
      ],
      steps: [
        {
          instruction: "Combine all ingredients in a large saucepan.",
        },
        {
          instruction: "Bring to a simmer over medium heat.",
        },
        {
          instruction:
            "Reduce heat and simmer for 10 minutes to infuse flavors.",
        },
        {
          instruction: "Strain into mugs and serve warm.",
        },
      ],
    },
    {
      userId: janeDoe.id,
      title: "Greek Salad",
      description: "A refreshing Mediterranean salad.",
      imageUrl:
        "https://images.unsplash.com/photo-1570197571499-166b36435e9f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c2FsYWR8ZW58MHx8MHx8fDA%3D",
      preparationTime: 10,
      cookingTime: 0,
      servings: 4,
      tags: ["Salad", "Healthy", "Vegetarian"],
      sections: [
        {
          name: "Ingredients",
          ingredients: [
            { name: "Cucumber", quantity: 1, unit: "whole" },
            { name: "Tomatoes", quantity: 2, unit: "whole" },
            { name: "Red onion", quantity: 0.5, unit: "whole" },
            { name: "Feta cheese", quantity: 0.5, unit: "cup" },
            { name: "Kalamata olives", quantity: 0.25, unit: "cup" },
            { name: "Olive oil", quantity: 2, unit: "tbsp" },
            { name: "Lemon juice", quantity: 1, unit: "tbsp" },
            { name: "Dried oregano", quantity: 1, unit: "tsp" },
          ],
        },
      ],
      steps: [
        {
          instruction:
            "Chop cucumber, tomatoes, and red onion into bite-sized pieces.",
        },
        {
          instruction:
            "Combine vegetables, feta cheese, and olives in a large bowl.",
        },
        {
          instruction: "Drizzle with olive oil and lemon juice.",
        },
        {
          instruction: "Sprinkle with oregano and toss to combine.",
        },
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
