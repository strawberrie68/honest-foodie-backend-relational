// Email validation using regex
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Username validation - alphanumeric, 3-20 characters, no special chars except underscore
const validateUsername = (username) => {
  // Allow letters, numbers, and underscores, must start with a letter
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
  return usernameRegex.test(username);
};

// Password validation - minimum 8 characters, at least one uppercase, one lowercase, one number
const validatePassword = (password) => {
  if (!password || password.length < 8) return false;

  // Check for minimum requirements
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  return hasUpperCase && hasLowerCase && hasNumbers;
};

// Recipe time validation (preparation and cooking time)
const validateTime = (time) => {
  if (time === undefined || time === null) return true; // Optional field
  const parsedTime = parseInt(time);
  return !isNaN(parsedTime) && parsedTime >= 0;
};

// Recipe servings validation
const validateServings = (servings) => {
  if (servings === undefined || servings === null) return true; // Optional field
  const parsedServings = parseInt(servings);
  return !isNaN(parsedServings) && parsedServings > 0;
};

// Recipe steps validation
const validateSteps = (steps) => {
  if (!steps) return true; // Optional field
  if (!Array.isArray(steps)) return false;

  return steps.every(
    (step) =>
      step &&
      typeof step.instruction === "string" &&
      step.instruction.trim().length > 0
  );
};

// Helper function to get validation error messages
const getValidationErrors = (field, value) => {
  switch (field) {
    case "username":
      if (!value) return "Username is required";
      if (value.length < 3)
        return "Username must be at least 3 characters long";
      if (value.length > 20) return "Username must be less than 20 characters";
      if (!/^[a-zA-Z]/.test(value)) return "Username must start with a letter";
      if (!/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/.test(value))
        return "Username can only contain letters, numbers, and underscores";
      return null;

    case "password":
      if (!value) return "Password is required";
      if (value.length < 8)
        return "Password must be at least 8 characters long";
      if (!/[A-Z]/.test(value))
        return "Password must contain at least one uppercase letter";
      if (!/[a-z]/.test(value))
        return "Password must contain at least one lowercase letter";
      if (!/\d/.test(value)) return "Password must contain at least one number";
      return null;

    case "email":
      if (!value) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Invalid email format";
      return null;

    case "preparationTime":
    case "cookingTime":
      if (!validateTime(value)) return `${field} must be a positive number`;
      return null;

    case "servings":
      if (!validateServings(value)) return "Servings must be a positive number";
      return null;

    case "steps":
      if (!validateSteps(value)) return "Invalid recipe steps format";
      return null;

    default:
      return null;
  }
};

module.exports = {
  validateEmail,
  validateUsername,
  validatePassword,
  validateTime,
  validateServings,
  validateSteps,
  getValidationErrors,
};
