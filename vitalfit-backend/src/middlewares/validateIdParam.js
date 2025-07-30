// middlewares/validateIdParam.js
module.exports.validateIdParam = (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "유효하지 않은 ID입니다.",
    });
  }
  next();
};
