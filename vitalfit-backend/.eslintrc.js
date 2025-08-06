module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: true, // 테스트 파일용
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended', // Prettier 통합
  ],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    // 학생 프로젝트용 완화된 규칙 (Backend)
    'no-unused-vars': 'warn', // 오류 → 경고로 완화
    'no-undef': 'error', // 정의되지 않은 변수는 오류
    'no-console': 'off', // console.log 허용
    'no-debugger': 'warn', // debugger 경고만

    // Prettier 통합
    'prettier/prettier': 'warn', // Prettier 규칙 위반시 경고
  },
};
