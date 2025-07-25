# VitalFit Backend

VitalFit 프로젝트의 백엔드 API 서버입니다.

## 프로젝트 가이드

- **CONTRIBUTING.md**: 코드 컨벤션과 커밋 메시지 규칙
- **API_SPEC.md**: API 명세서 예시
- **.env.example**: 환경변수 설정 예시

## 환경변수 설정

프로젝트를 처음 클론한 후, 환경변수 파일을 생성하세요:

```bash
cp .env.example .env
```

.env 파일에 실제 사용하는 DB, 이메일, 소셜 로그인, AWS 등 정보를 입력해야 서버가 정상 동작합니다.

## Git 명령어 실행 방법

### 기본 작업 흐름

```bash
# 변경사항 확인
git status

# 파일 추가
git add .

# 커밋
git commit -m "[타입] 설명"

# 원격 저장소에 푸시
git push origin main
```

### 브랜치 작업

```bash
# 새 브랜치 생성
git checkout -b feature/login

# 브랜치 변경
git checkout main

# 브랜치 병합
git merge feature/login
```

### 변경사항 되돌리기

```bash
# 마지막 커밋 취소
git reset --soft HEAD~1

# 특정 파일 변경사항 취소
git checkout -- filename
```

## 코드 컨벤션 및 커밋 규칙

- **코드 컨벤션**: 파일명, 함수명, 변수명 등 코딩 스타일 규칙
- **커밋 메시지 규칙**: [타입] 설명 형식의 커밋 메시지 작성법

자세한 내용은 **CONTRIBUTING.md** 파일을 참고하세요.

## 실행 방법

### 의존성 설치

```bash
npm install
```

### 서버 실행

```bash
npm start
```

서버가 정상 실행되면: ✅ Server running on http://localhost:3000

## 폴더 구조

```
vitalfit-backend/
  └─ public/
      ├─ logo/                # 로고 이미지 저장
      ├─ profiles/            # 직원 프로필 사진 저장
      └─ stores/              # 매장 사진 저장
  └─ src/
      ├─ app.js                # Express 서버의 진입점
      ├─ config/               # DB 및 환경설정 관련 파일
      │    └─ config.js        # 데이터베이스 설정 파일
      ├─ controllers/          # 라우터에서 호출하는 비즈니스 로직 처리
      ├─ middlewares/          # 공통 미들웨어(인증, 에러처리 등)
      ├─ models/               # Sequelize 모델(테이블 구조 정의)
      ├─ routes/               # API 라우터 정의
      ├─ services/             # 서비스 계층(비즈니스 로직 분리 시 사용)
      ├─ utils/                # 유틸리티 함수 모음
  └─ test/
      └─ test-connection.js    # DB 연결 테스트
  └─ .gitignore
  └─ package.json
  └─ README.md
  └─ CONTRIBUTING.md           # 코드 컨벤션/커밋 규칙
  └─ .env.example              # 환경변수 예시
```

## 기술 스택

- Node.js
- Express
- Sequelize (ORM)
- PostgreSQL
- JWT (인증)

## 팀 협업 규칙

- .env 파일은 절대 공유 금지
- PR은 리뷰 후 병합
- 코드 컨벤션은 CONTRIBUTING.md 참고

---
