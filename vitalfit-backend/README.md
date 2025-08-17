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

## API 엔드포인트

### 센터 관리 API

#### 센터 등록
- **POST** `/api/centers`
- **설명**: 새로운 센터를 등록합니다.
- **요청 본문**:
  ```json
  {
    "name": "센터명 (필수)",
    "address": "주소 (필수)",
    "phone": "전화번호 (필수)",
    "description": "센터 설명 (선택)",
    "weekday_hours": "평일 운영시간 (선택)",
    "saturday_hours": "토요일 운영시간 (선택)",
    "sunday_hours": "일요일 운영시간 (선택)",
    "holiday_hours": "공휴일 운영시간 (선택)",
    "has_parking": true/false,
    "parking_fee": "주차요금 (선택)",
    "parking_info": "주차정보 (선택)",
    "directions": "오시는 길 (선택)",
    "status": "active/inactive/closed"
  }
  ```
- **응답**:
  ```json
  {
    "success": true,
    "message": "센터 등록 성공",
    "data": {
      "id": 1,
      "name": "센터명",
      "address": "주소",
      "phone": "전화번호",
      // ... 기타 필드들
    }
  }
  ```

#### 센터 목록 조회
- **GET** `/api/centers`
- **설명**: 모든 활성 센터 목록을 조회합니다.

#### 센터 상세 조회
- **GET** `/api/centers/:id`
- **설명**: 특정 센터의 상세 정보를 조회합니다.

#### 센터 수정
- **PUT** `/api/centers/:id`
- **설명**: 센터 정보를 수정합니다.

#### 센터 삭제
- **DELETE** `/api/centers/:id`
- **설명**: 센터를 삭제합니다.

## 기술 스택

- Node.js
- Express
- Sequelize (ORM)
- PostgreSQL
- JWT (인증)
- Joi (유효성 검사)

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
