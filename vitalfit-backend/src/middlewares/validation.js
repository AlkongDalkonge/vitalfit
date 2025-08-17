const Joi = require('joi');

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

// 센터 등록 유효성 검사 스키마
const createCenterSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': '센터명은 필수 입력 항목입니다.',
    'string.max': '센터명은 100자 이하여야 합니다.',
    'any.required': '센터명은 필수 입력 항목입니다.',
  }),
  address: Joi.string().trim().min(1).required().messages({
    'string.empty': '주소는 필수 입력 항목입니다.',
    'any.required': '주소는 필수 입력 항목입니다.',
  }),
  phone: Joi.string()
    .trim()
    .min(1)
    .max(20)
    .required()
    .pattern(/^[0-9-+\s()]+$/)
    .messages({
      'string.empty': '전화번호는 필수 입력 항목입니다.',
      'string.max': '전화번호는 20자 이하여야 합니다.',
      'string.pattern.base': '올바른 전화번호 형식이 아닙니다.',
      'any.required': '전화번호는 필수 입력 항목입니다.',
    }),
  description: Joi.string().trim().allow('', null).optional(),
  weekday_hours: Joi.string().trim().max(50).allow('', null).optional(),
  saturday_hours: Joi.string().trim().max(50).allow('', null).optional(),
  sunday_hours: Joi.string().trim().max(50).allow('', null).optional(),
  holiday_hours: Joi.string().trim().max(50).allow('', null).optional(),
  has_parking: Joi.boolean().default(false),
  parking_fee: Joi.string().trim().max(50).allow('', null).optional(),
  parking_info: Joi.string().trim().allow('', null).optional(),
  directions: Joi.string().trim().max(200).allow('', null).optional(),
  status: Joi.string().valid('active', 'inactive', 'closed').default('active'),
});

module.exports = {
  validateRequest,
  createCenterSchema,
};
