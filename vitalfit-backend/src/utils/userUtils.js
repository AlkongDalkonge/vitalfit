const bcrypt = require('bcrypt');

// 비밀번호 해시 생성
const createHash = async password => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// 외래키 유효성 검사
const validateForeignKey = async (Model, id, name) => {
  const exists = await Model.findByPk(id);
  if (!exists) {
    const err = new Error(`${name} 정보가 유효하지 않습니다.`);
    err.status = 400;
    throw err;
  }
};

module.exports = {
  createHash,
  validateForeignKey,
};
