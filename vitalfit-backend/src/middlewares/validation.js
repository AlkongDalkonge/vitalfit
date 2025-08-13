const validateRequest = schema => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 올바르지 않습니다.',
        errors: errorMessage,
      });
    }

    // 검증된 데이터를 req.body에 다시 할당
    req.body = value;
    next();
  };
};

module.exports = {
  validateRequest,
};
