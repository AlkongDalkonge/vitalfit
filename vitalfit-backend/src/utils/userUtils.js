const bcrypt = require('bcrypt');

// 비밀번호 해시 생성
const createHash = async password => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 개발/디버깅용: 해시화된 비밀번호 로그 출력
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 비밀번호 해시 정보:');
    console.log('원본 비밀번호:', password);
    console.log('해시화된 비밀번호:', hashedPassword);
    console.log('Salt:', salt);
    console.log('---');
  }

  return hashedPassword;
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
