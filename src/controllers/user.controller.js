const express = require("express");
const UserService = require("../services/user.service");
const { generateToken } = require("../utils/auth");
const router = express.Router();

// Register new user
router.post("/register", async (req, res, next) => {
  try {
    const user = await UserService.createUser(req.body);
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    try {
      const validationErrors = JSON.parse(error.message);
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    } catch {
      next(error);
    }
  }
});

// Login user
router.post("/login", async (req, res, next) => {
  console.log("backend login being hit");
  try {
    const { email, password } = req.body;
    const user = await UserService.authenticateUser(email, password);
    const token = generateToken(user);
    res.json({
      success: true,
      data: user,
      token: token,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Invalid credentials",
    });
  }
});

// Update user profile
router.put("/:id", async (req, res, next) => {
  try {
    const user = await UserService.updateUser(req.params.id, req.body);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    try {
      const validationErrors = JSON.parse(error.message);
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    } catch {
      next(error);
    }
  }
});

// Get public profile
router.get("/:id/public", async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    const profile = await UserService.getPublicProfile(userId);
    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

// Get private profile (should be protected with auth middleware in production)
router.get("/:id/private", async (req, res, next) => {
  try {
    const profile = await UserService.getPrivateProfile(req.params.id);
    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

// Follow user
router.post("/:id/follow", async (req, res, next) => {
  try {
    await UserService.followUser(req.body.followerId, req.params.id);
    res.json({
      success: true,
      message: "Successfully followed user",
    });
  } catch (error) {
    next(error);
  }
});

// Unfollow user
router.post("/:id/unfollow", async (req, res, next) => {
  try {
    await UserService.unfollowUser(req.body.followerId, req.params.id);
    res.json({
      success: true,
      message: "Successfully unfollowed user",
    });
  } catch (error) {
    next(error);
  }
});

// Get user's followers
router.get("/:id/followers", async (req, res, next) => {
  try {
    const followers = await UserService.getUserFollowers(req.params.id);
    res.json({
      success: true,
      data: followers,
    });
  } catch (error) {
    next(error);
  }
});

// Get user's following
router.get("/:id/following", async (req, res, next) => {
  try {
    const following = await UserService.getUserFollowing(req.params.id);
    res.json({
      success: true,
      data: following,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;