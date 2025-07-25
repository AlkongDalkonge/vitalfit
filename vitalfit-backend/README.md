# 💪 VITAL FIT - Backend

헬스장, 피트니스, 골프장 등 다양한 센터의 **트레이너 정산 시스템**을 위한 백엔드 API 서버입니다.  
Node.js + Express 기반으로 개발되었으며, 효율적인 센터 운영과 투명한 급여 정산을 지원합니다.

---

## 📌 주요 기능

- 회원가입 / 로그인 (JWT 인증)
- 지점, 트레이너, 고객 관리
- 수업 기록 및 출석 관리
- 정산 시스템 (정산 요청, 확인, 확정 등)
- 공지사항 / 알림 기능
- 관리자 권한 제어

---

## 📁 폴더 구조

vitalfit-backend/
├── src/
│ ├── config/ # 환경 설정 (DB, dotenv 등)
│ ├── controllers/ # 라우터 요청 처리
│ ├── routes/ # API 라우팅
│ ├── models/ # DB 모델 정의
│ ├── middlewares/ # 인증, 오류 처리 등 미들웨어
│ ├── services/ # 핵심 비즈니스 로직
│ ├── utils/ # 공용 유틸 함수
│ └── app.js # Express 앱 세팅
├── .env # 환경변수 파일
├── .gitignore
├── index.js # 서버 시작점
├── package.json

---

## 🛠️ 설치 방법

1. 리포지토리 클론

```bash
git clone https://github.com/your-username/vitalfit-backend.git
cd vitalfit-backend
```

2. 의존성설치
   npm install

3. .env 파일생성

# .env 예시

PORT=3000
JWT_SECRET=your_jwt_secret_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=vitalfit

4. 실행방법
   npm start
   서버가 정상 실행되면: ✅ Server running on http://localhost:3000

🧑‍💻 기술 스택
Node.js
Express
MySQL (Sequelize ORM 예정)
JWT (인증)
dotenv (환경변수 관리)

📬 협업 규칙
브랜치 명: feature/기능명, fix/버그, hotfix/긴급수정
커밋 메시지 컨벤션: - feat: 기능 추가 - fix: 버그 수정 - docs: 문서 변경
커밋 메시지 컨벤션: feat: 기능 추가, fix: 버그 수정, docs: 문서 변경 등
.env 파일은 절대 공유 금지
PR은 리뷰 후 병합
