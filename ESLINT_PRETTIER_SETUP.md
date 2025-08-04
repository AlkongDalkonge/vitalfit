# 🔧 VitalFit 프로젝트 - ESLint + Prettier 자동 검사 환경 가이드

> **학생 팀프로젝트용 코드 품질 자동화 도구**

---

## 🎯 **이 가이드로 얻는 것**

- ✅ **저장 시 자동 포맷팅** (VSCode)
- ✅ **커밋 시 자동 검사** (Git Hook)
- ✅ **일관된 코드 스타일** (팀 전체)
- ✅ **실시간 오류 감지** (개발 중)
- ✅ **학습 친화적** (경고 위주, 강제 아님)

---

## 📋 **사전 준비**

### **1. 필수 소프트웨어**
- ✅ **Node.js** (v16 이상)
- ✅ **Git**
- ✅ **VSCode** (추천 에디터)

### **2. VSCode 확장 프로그램 설치 (필수)**
```
1. Prettier - Code formatter
2. ESLint
```
**설치 방법**: `Ctrl/Cmd + Shift + X` → 검색 → Install

---

## 🚀 **1단계: 프로젝트 클론 & 설치**

### **📥 저장소 클론**
```bash
git clone [저장소 주소]
cd vitalfit
```

### **📦 의존성 설치 (3단계)**
```bash
# 1. 루트 설치 (통합 스크립트용)
npm install

# 2. 백엔드 설치
cd vitalfit-backend
npm install

# 3. 프론트엔드 설치  
cd ../vitalfit-frontend
npm install

# 4. 루트로 돌아가기
cd ..
```

---

## ⚡ **2단계: 자동 적용 확인**

### **🔍 설치 확인**
```bash
# ESLint 버전 확인 (v8.57.1 이어야 함)
cd vitalfit-frontend && npx eslint --version
cd ../vitalfit-backend && npx eslint --version

# Prettier 버전 확인
cd .. && npx prettier --version
```

### **🧪 테스트**
```bash
# 루트에서 전체 프로젝트 테스트
npm run lint        # 전체 검사
npm run lint:fix    # 전체 자동 수정
npm run format      # 전체 포맷팅
```

---

## 💾 **3단계: VSCode 자동 저장 설정**

### **✅ 확인 사항**
1. `.vscode/settings.json` 파일이 있는지 확인
2. 아래 내용이 설정되어 있는지 확인:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

### **🔥 테스트 방법**
1. `vitalfit-frontend/src/App.jsx` 파일 열기
2. 코드 들여쓰기 망치기
3. `Ctrl/Cmd + S` (저장)
4. **자동으로 정리되는지 확인!** ✨

---

## 🛡️ **4단계: Git 커밋 시 자동 검사**

### **✅ Husky 설정 확인**
```bash
# .husky/pre-commit 파일 존재 확인
ls -la .husky/

# 내용 확인 (npx lint-staged 라고 되어있어야 함)
cat .husky/pre-commit
```

### **🧪 커밋 테스트**
```bash
# 1. 파일 수정해보기
echo "console.log('test')" >> vitalfit-frontend/src/test.js

# 2. 커밋 시도 (자동 검사 실행됨)
git add .
git commit -m "test: 자동 검사 테스트"

# 3. 자동으로 린팅 & 포맷팅 적용되는지 확인!
```

---

## 📖 **사용법 가이드**

### **🔄 일상적인 개발 플로우**

1. **코딩**: 평소처럼 코드 작성
2. **저장**: `Ctrl/Cmd + S` → **자동 포맷팅** ✨
3. **커밋**: `git commit` → **자동 검사 + 수정** ✨
4. **완료**: 일관된 코드 스타일로 커밋됨! 🎉

### **📝 명령어 모음**

```bash
# 루트에서 전체 프로젝트 관리
npm run lint           # 전체 검사만
npm run lint:fix       # 전체 자동 수정  
npm run format         # 전체 포맷팅
npm run format:check   # 포맷 체크만

# 개별 폴더에서 관리
cd vitalfit-frontend
npx eslint src/                    # 프론트엔드 검사
npx eslint --fix src/              # 프론트엔드 자동 수정
npx prettier --write "src/**/*.{js,jsx}"  # 프론트엔드 포맷팅

cd ../vitalfit-backend  
npx eslint src/                    # 백엔드 검사
npx eslint --fix src/              # 백엔드 자동 수정
npx prettier --write "src/**/*.js"        # 백엔드 포맷팅
```

---

## 🎯 **학생 프로젝트 최적화 특징**

### **✅ 허용하는 것들 (걱정 NO)**
- 🟢 `console.log()` 자유롭게 사용
- 🟢 사용되지 않는 변수 (경고만, 오류 아님)
- 🟢 React import 생략 (React 17+)
- 🟢 PropTypes 검증 생략
- 🟢 들여쓰기, 따옴표 스타일 (자동 정리됨)

### **⚠️ 경고만 표시 (참고용)**
- 🟡 사용되지 않는 변수들
- 🟡 Prettier 스타일 위반
- 🟡 debugger 사용

### **❌ 반드시 수정해야 하는 것들**
- 🔴 정의되지 않은 변수 사용
- 🔴 심각한 문법 오류

---

## 🚨 **문제 해결 가이드**

### **❓ ESLint가 작동하지 않을 때**
```bash
# 1. 버전 확인
npx eslint --version  # v8.57.1 이어야 함

# 2. 설정 파일 확인
ls -la vitalfit-frontend/.eslintrc.js
ls -la vitalfit-backend/.eslintrc.js

# 3. 재설치
cd vitalfit-frontend && npm install
cd ../vitalfit-backend && npm install
```

### **❓ Prettier가 작동하지 않을 때**
```bash
# 1. VSCode 확장 확인
# Extensions에서 "Prettier - Code formatter" 설치 확인

# 2. 설정 파일 확인  
ls -la vitalfit-frontend/.prettierrc
ls -la vitalfit-backend/.prettierrc

# 3. VSCode 설정 확인
cat .vscode/settings.json
```

### **❓ 커밋이 막힐 때**
```bash
# 1. 수동으로 수정 후 재커밋
npm run lint:fix
npm run format
git add .
git commit -m "메시지"

# 2. 임시로 건너뛰기 (비추천)
git commit -m "메시지" --no-verify
```

---

## 💡 **팁 & 트릭**

### **🔥 생산성 향상 팁**
1. **저장 단축키** 자주 사용: `Ctrl/Cmd + S`
2. **Quick Fix** 활용: `Ctrl/Cmd + .` (전구 아이콘)
3. **전체 포맷팅**: `Shift + Alt + F`
4. **문제 패널** 확인: `Ctrl/Cmd + Shift + M`

### **👥 팀 협업 팁**
1. **커밋 전** 한번 더 확인: `npm run lint`
2. **큰 파일 수정 후**: `npm run format`
3. **에러 무시하지 말고** 팀에 공유
4. **설정 변경 시** 팀원들에게 공유

---

## 📞 **도움이 필요할 때**

### **🆘 문제 발생 시**
1. **에러 메시지** 스크린샷 찍기
2. **어떤 파일**에서 문제 발생했는지 공유
3. **어떤 작업** 중이었는지 설명
4. 팀원들과 **공유해서 해결**

### **📚 추가 학습 자료**
- [ESLint 공식 문서](https://eslint.org/docs/latest/)
- [Prettier 공식 문서](https://prettier.io/docs/en/)
- [VSCode ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

---

## 🎉 **성공 체크리스트**

### **✅ 설치 완료 확인**
- [ ] Node.js, Git, VSCode 설치됨
- [ ] VSCode 확장 프로그램 설치됨 (ESLint, Prettier)
- [ ] 프로젝트 클론 및 의존성 설치 완료
- [ ] `npm run lint` 명령어 실행됨

### **✅ 자동화 확인**
- [ ] 파일 저장 시 자동 포맷팅 됨
- [ ] VSCode에서 실시간 오류 표시됨  
- [ ] 커밋 시 자동 검사 실행됨
- [ ] `npm run format` 명령어 작동함

### **✅ 팀 협업 준비**
- [ ] 모든 팀원이 동일한 환경 구축
- [ ] 코드 스타일이 통일됨
- [ ] 문제 발생 시 해결 방법 숙지

---

**🎉 축하합니다! 이제 전문적인 개발 환경이 구축되었습니다!**  
**코딩에만 집중하세요. 나머지는 자동으로 처리됩니다!** ✨

---

**📅 마지막 업데이트**: 2025년 7월 31일  
**🔧 설정 버전**: ESLint v8.57.1, Prettier v3.6.2, Husky v9.1.7