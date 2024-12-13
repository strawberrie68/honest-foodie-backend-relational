const { PrismaClient } = require("@prisma/client");

class UserRepository {
  constructor() {
    this.prisma = new PrismaClient();
  }

  // Create a new user in the database
  async create(userData) {
    return this.prisma.user.create({
      data: userData,
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true,
        bio: true,
        createdAt: true,
      },
    });
  }

  // Find user by email
  async findByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Find user by ID
  async findById(userId) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true,
        bio: true,
        createdAt: true,
        recipes: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            createdAt: true,
          },
        },
        Review: {
          select: {
            id: true,
            reviewText: true,
            rating: true,
            imageUrl: true,
            createdAt: true,
            recipe: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
                userId: true,
                user: true,
              },
            },
          },
        },
      },
    });
  }

  // Update user
  async update(userId, updateData) {
    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true,
        bio: true,
      },
    });
  }

  // Delete user
  async delete(userId) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  // Check if username exists
  async usernameExists(username) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    return !!user;
  }

  // Follow a user
  async follow(followerId, followingId) {
    return this.prisma.userFollows.create({
      data: {
        followerId,
        followingId,
      },
    });
  }

  // Unfollow a user
  async unfollow(followerId, followingId) {
    return this.prisma.userFollows.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });
  }

  // Get user's followers
  async getFollowers(userId) {
    return this.prisma.userFollows.findMany({
      where: { followingId: userId },
      select: {
        follower: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
      },
    });
  }

  // Get users the user is following
  async getFollowing(userId) {
    return this.prisma.userFollows.findMany({
      where: { followerId: userId },
      select: {
        following: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
      },
    });
  }

  // Get follower count
  async getFollowerCount(userId) {
    return this.prisma.userFollows.count({
      where: { followingId: userId },
    });
  }

  // Get following count
  async getFollowingCount(userId) {
    return this.prisma.userFollows.count({
      where: { followerId: userId },
    });
  }

  // Toggle favorite recipe
  async toggleFavorite(userId, recipeId) {
    const existingFavorite = await this.prisma.userFavorites.findFirst({
      where: { userId, recipeId },
    });

    if (existingFavorite) {
      // Remove from favorites
      await this.prisma.userFavorites.delete({
        where: { id: existingFavorite.id },
      });
      return { action: "removed" };
    } else {
      // Add to favorites
      await this.prisma.userFavorites.create({
        data: {
          userId,
          recipeId,
        },
      });
      return { action: "added" };
    }
  }

  // Get user's favorite recipes
  async getFavorites(userId) {
    return this.prisma.userFavorites.findMany({
      where: { userId },
      select: {
        recipe: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });
  }
}

module.exports = new UserRepository();
