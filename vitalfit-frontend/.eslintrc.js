module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true, // 테스트 파일용
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended', // Prettier 통합
  ],
  plugins: ['react', 'prettier'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    // 학생 프로젝트용 완화된 규칙 (Frontend)
    'no-unused-vars': 'warn', // 오류 → 경고로 완화
    'no-undef': 'error', // 정의되지 않은 변수는 오류
    'no-console': 'off', // console.log 허용
    'no-debugger': 'warn', // debugger 경고만

    // Prettier 통합
    'prettier/prettier': 'warn', // Prettier 규칙 위반시 경고

    // React 규칙 (학생 프로젝트용)
    'react/react-in-jsx-scope': 'off', // React import 불필요 (React 17+)
    'react/jsx-uses-react': 'off', // React import 불필요
    'react/jsx-key': 'warn', // key prop 경고만
    'react/prop-types': 'off', // PropTypes 검증 끄기
    'react/display-name': 'off', // displayName 끄기
    'react/no-unescaped-entities': 'off', // HTML 엔티티 자유
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
