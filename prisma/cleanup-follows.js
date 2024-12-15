const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanupDuplicateFollows() {
  try {
    // Get all follows
    const allFollows = await prisma.userFollows.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    // Track unique follows we want to keep
    const seenPairs = new Set();
    const duplicateIds = [];

    // Identify duplicates (keeping the earliest one)
    allFollows.forEach((follow) => {
      const pairKey = `${follow.followerId}-${follow.followingId}`;
      if (seenPairs.has(pairKey)) {
        duplicateIds.push(follow.id);
      } else {
        seenPairs.add(pairKey);
      }
    });

    // Delete duplicates
    if (duplicateIds.length > 0) {
      await prisma.userFollows.deleteMany({
        where: {
          id: {
            in: duplicateIds,
          },
        },
      });
      console.log(`Removed ${duplicateIds.length} duplicate follows`);
    } else {
      console.log("No duplicate follows found");
    }
  } catch (error) {
    console.error("Error cleaning up duplicate follows:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateFollows();
