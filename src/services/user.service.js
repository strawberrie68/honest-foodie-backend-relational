const bcrypt = require("bcryptjs");
const UserRepository = require("../repositories/user.repository");
const {
  validateEmail,
  validateUsername,
  validatePassword,
  getValidationErrors,
} = require("../utils/validation");

class UserService {
  // Create a new user with validation
  async createUser(userData) {
    const { username, email, password } = userData;
    const errors = {};

    // Validate all fields and collect errors
    const usernameError = getValidationErrors("username", username);
    const emailError = getValidationErrors("email", email);
    const passwordError = getValidationErrors("password", password);

    if (usernameError) errors.username = usernameError;
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;

    // Check for existing username
    const usernameExists = await UserRepository.usernameExists(username);
    if (usernameExists) {
      errors.username = "Username is already taken";
    }

    // Check for existing email
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      errors.email = "Email is already in use";
    }

    // If there are any validation errors, throw them all at once
    if (Object.keys(errors).length > 0) {
      throw new Error(JSON.stringify(errors));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data
    const userDataToSave = {
      ...userData,
      password: hashedPassword,
    };

    // Create user
    return UserRepository.create(userDataToSave);
  }

  // Authenticate user
  async authenticateUser(email, password) {
    // Find user by email
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Remove sensitive information
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Update user profile
  async updateUser(userId, updateData) {
    const errors = {};

    // Validate email if provided
    if (updateData.email) {
      const emailError = getValidationErrors("email", updateData.email);
      if (emailError) errors.email = emailError;

      // Check if email is already in use by another user
      const existingUser = await UserRepository.findByEmail(updateData.email);
      if (existingUser && existingUser.id !== userId) {
        errors.email = "Email is already in use";
      }
    }

    // Validate username if provided
    if (updateData.username) {
      const usernameError = getValidationErrors(
        "username",
        updateData.username
      );
      if (usernameError) errors.username = usernameError;

      // Check if username is already taken
      const usernameExists = await UserRepository.usernameExists(
        updateData.username
      );
      if (usernameExists) {
        errors.username = "Username is already taken";
      }
    }

    // Validate password if provided
    if (updateData.password) {
      const passwordError = getValidationErrors(
        "password",
        updateData.password
      );
      if (passwordError) errors.password = passwordError;

      // Hash new password
      if (!errors.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
    }

    // If there are any validation errors, throw them all at once
    if (Object.keys(errors).length > 0) {
      throw new Error(JSON.stringify(errors));
    }

    // Update user
    return UserRepository.update(userId, updateData);
  }

  // Follow a user
  async followUser(followerId, followingId) {
    // Prevent self-following
    if (followerId === followingId) {
      throw new Error("Cannot follow yourself");
    }

    // Verify user exists
    const userToFollow = await UserRepository.findById(followingId);
    if (!userToFollow) {
      throw new Error("User to follow not found");
    }

    return UserRepository.follow(followerId, followingId);
  }

  // Unfollow a user
  async unfollowUser(followerId, followingId) {
    // Prevent self-unfollowing
    if (followerId === followingId) {
      throw new Error("Cannot unfollow yourself");
    }

    return UserRepository.unfollow(followerId, followingId);
  }

  // Get public profile (no sensitive data)
  async getPublicProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Return only public information
    const { password: _, email: __, ...publicProfile } = user;

    return {
      ...publicProfile,
      followerCount: await UserRepository.getFollowerCount(userId),
      followingCount: await UserRepository.getFollowingCount(userId),
    };
  }

  // Get private profile (includes sensitive data)
  async getPrivateProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Remove password but keep other sensitive data
    const { password: _, ...privateProfile } = user;

    return {
      ...privateProfile,
      followerCount: await UserRepository.getFollowerCount(userId),
      followingCount: await UserRepository.getFollowingCount(userId),
    };
  }

  // Get followers
  async getUserFollowers(userId) {
    const followers = await UserRepository.getFollowers(userId);
    return followers.map((f) => f.follower);
  }

  // Get following
  async getUserFollowing(userId) {
    const following = await UserRepository.getFollowing(userId);
    return following.map((f) => f.following);
  }

  // Toggle favorite recipe
  async toggleFavorite(userId, recipeId) {
    // Validate inputs
    if (!userId || !recipeId) {
      throw new Error("User ID and Recipe ID are required");
    }

    // Convert to integers if they're strings
    const userIdInt = parseInt(userId);
    const recipeIdInt = parseInt(recipeId);

    if (isNaN(userIdInt) || isNaN(recipeIdInt)) {
      throw new Error("Invalid User ID or Recipe ID");
    }

    return UserRepository.toggleFavorite(userIdInt, recipeIdInt);
  }

  // Get user's favorite recipes
  async getUserFavorites(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      throw new Error("Invalid User ID");
    }

    const favorites = await UserRepository.getFavorites(userIdInt);
    return favorites.map((favorite) => favorite.recipe);
  }
}

module.exports = new UserService();
