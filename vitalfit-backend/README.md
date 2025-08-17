# VitalFit Backend

## 🚀 빠른 시작

```bash
npm install
npm start
```

## 🗄️ 데이터베이스 설정

### PostgreSQL 설치 및 설정

1. PostgreSQL 설치
2. 데이터베이스 생성: `vitalfit_dev`
3. `.env` 파일에 연결 정보 설정

### 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env

# 데이터베이스 정보 입력
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vitalfit_dev
DB_USER=your_username
DB_PASSWORD=your_password
```

## ⚠️ 주의사항

### gender 필드 관련 문제 해결

만약 다음과 같은 에러가 발생한다면:

```
error: unterminated quoted string at or near "';"
sql: `DO 'BEGIN CREATE TYPE "public"."enum_users_gender" AS ENUM(''male'', ''female''); ...`
```

**해결 방법:**

1. PostgreSQL에 연결
2. 다음 명령어 실행:

```sql
DROP TYPE IF EXISTS "public"."enum_users_gender" CASCADE;
ALTER TABLE "public"."users" DROP COLUMN IF EXISTS "gender";
```

3. 서버 재시작

### Sequelize 동기화 설정

- **개발 환경**: `src/models/index.js`에서 `sequelize.sync()` 활성화
- **프로덕션 환경**: `sequelize.sync()` 비활성화

## 🔧 개발 가이드

### 모델 수정 시 주의사항

1. **새 필드 추가**: 기존 데이터와 호환성 확인
2. **필드 타입 변경**: 데이터 마이그레이션 계획 수립
3. **ENUM 사용**: PostgreSQL 호환성 문제 가능성 고려

### 데이터베이스 동기화

```javascript
// 개발 환경
sequelize.sync({ force: false, alter: true });

// 프로덕션 환경
// sequelize.sync() 사용 금지
```

## 📞 문제 해결

### 일반적인 문제들

1. **연결 거부**: PostgreSQL 서버 실행 상태 확인
2. **권한 오류**: 데이터베이스 사용자 권한 확인
3. **스키마 오류**: 위의 gender 필드 해결 방법 참조

### 팀원 간 공유

- 모델 변경사항은 반드시 팀에 공지
- 데이터베이스 스키마 변경 시 마이그레이션 가이드 제공
- 환경별 설정 파일 분리 권장
