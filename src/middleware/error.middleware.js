const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Prisma specific error handling
  if (err.code === "P2002") {
    return res.status(400).json({
      success: false,
      errors: [
        {
          field: err.meta?.target?.[0] || "unknown", // Prisma provides the field name in meta.target
          message: "This value is already taken",
          details: err.message,
        },
      ],
    });
  }

  // Generic error response
  res.status(err.status || 500).json({
    success: false,
    errors: [
      {
        field: "general",
        message: err.message || "An unexpected error occurred",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      },
    ],
  });
};

module.exports = errorHandler;
