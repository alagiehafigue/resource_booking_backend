export const errorHandler = (req, res, error, next) => {
  const statusCode = res.statusCode ? statusCode : "500";
  res.status(statusCode);

  res.json({
    message: error.message,
  });
};
