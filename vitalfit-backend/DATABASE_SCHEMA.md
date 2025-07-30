# 🗄️ 데이터베이스 스키마 명세서

VitalFit 프로젝트의 데이터베이스 테이블 구조 및 관계를 정의합니다.

## 📋 목차

1. [테이블 관계도](#테이블-관계도)
2. [테이블 명세서](#테이블-명세서)
   - [User (직원)](#user-직원)
   - [Center (센터)](#center-센터)
   - [CenterImage (센터 이미지)](#centerimage-센터-이미지)
   - [Team (팀)](#team-팀)
   - [Member (회원)](#member-회원)
   - [Payment (결제)](#payment-결제)
   - [PTSession (PT 세션)](#ptsession-pt-세션)
   - [Notice (공지사항)](#notice-공지사항)
   - [BaseSalary (기본급)](#basesalary-기본급)
   - [CommissionRate (수수료율)](#commissionrate-수수료율)
   - [MonthlySettlement (월별 정산)](#monthlysettlement-월별-정산)

---

## 🔗 테이블 관계도

```
Center (1) ──── (N) User
Center (1) ──── (N) CenterImage
Center (1) ──── (N) Team
Center (1) ──── (N) Member
Center (1) ──── (N) Payment
Center (1) ──── (N) PTSession
Center (1) ──── (N) MonthlySettlement

Team (1) ──── (N) User
Team (1) ──── (1) User (as leader)

User (1) ──── (N) Notice
User (1) ──── (N) Member (as trainer)
User (1) ──── (N) Payment (as trainer)
User (1) ──── (N) PTSession (as trainer)
User (1) ──── (N) MonthlySettlement

Member (1) ──── (N) Payment
Member (1) ──── (N) PTSession

BaseSalary (독립 테이블)
CommissionRate (독립 테이블)
```

---

## 📊 테이블 명세서

### User (직원)

**목적**: 직원(트레이너, 매니저, 관리자) 정보 관리

| 컬럼명             | 데이터 타입                                        | NULL 허용 | 기본값        | 설명                        | 필요 이유/비고              |
| ------------------ | -------------------------------------------------- | --------- | ------------- | --------------------------- | --------------------------- |
| id                 | INTEGER, autoIncrement, PK                         | X         |               | 고유 사용자 ID              | 중복 없는 식별자, FK 연결용 |
| name               | VARCHAR(100)                                       | X         |               | 사용자 이름                 | 기본 정보, 소통에 필요      |
| email              | VARCHAR(255), unique, isEmail                      | X         |               | 로그인용 이메일             | 로그인 ID, 중복 방지        |
| password           | VARCHAR(255)                                       | X         |               | 암호화된 비밀번호           | 로그인 보안                 |
| phone              | VARCHAR(20), len: 10~20                            | X         |               | 휴대폰 번호                 | 2차 인증, 연락처            |
| phone_verified     | BOOLEAN, default: false                            | X         | false         | 휴대폰 인증 여부            | 인증 완료 상태 확인         |
| role               | ENUM('trainer','manager','admin')                  | X         |               | 시스템 권한                 | 시스템 접근 권한 구분       |
| position           | ENUM('center_manager','team_leader','team_member') | X         | 'team_member' | 조직 내 직책                | 조직도, 직책 구분           |
| team_id            | INTEGER, FK                                        | O         |               | 소속 팀 ID                  | 팀 단위 업무/권한 관리      |
| center_id          | INTEGER, FK                                        | X         |               | 소속 센터 ID                | 센터별 데이터/업무 구분     |
| join_date          | DATEONLY                                           | X         |               | 입사일                      | 근무 시작일, 정산/출결 기준 |
| status             | ENUM('active','inactive','retired')                | X         | active        | 재직 상태                   | 퇴사/휴면 등 권한 관리      |
| leave_date         | DATEONLY                                           | O         |               | 퇴사일                      | 실제 퇴사 날짜 기록         |
| profile_image_name | VARCHAR(255)                                       | O         |               | 프로필 이미지의 원본 파일명 |                             |
| profile_image_url  | VARCHAR(255)                                       | O         |               | 저장된 이미지 경로(URL)     |                             |
| nickname           | VARCHAR(50)                                        | O         |               | 별명/닉네임                 | 친근한 이름, 커뮤니케이션   |
| license            | VARCHAR(200)                                       | O         |               | 자격증명                    | 강사 자격 증빙, 신뢰 확보   |
| experience         | TEXT                                               | O         |               | 경력사항                    | 업무 이력, 전문성 소개      |
| education          | VARCHAR(200)                                       | O         |               | 학력                        | 자격 요건, 신뢰성           |
| instagram          | VARCHAR(100)                                       | O         |               | 인스타그램 계정             | SNS 연동, 마케팅 활용       |
| shift              | VARCHAR(100)                                       | O         |               | 근무시간                    | 근무 일정 관리              |
| last_login_at      | DATE/TIMESTAMP                                     | O         |               | 마지막 로그인 시간          | 보안, 활동 기록             |
| login_attempts     | INTEGER, default: 0                                | X         | 0             | 로그인 시도 횟수            | 계정 잠금 등 보안           |
| is_locked          | BOOLEAN, default: false                            | X         | false         | 계정 잠금 여부              | 보안, 비정상 접근 차단      |
| created_at         | TIMESTAMP, auto                                    | X         | now()         | 생성일시                    | 자동 생성 (Sequelize)       |
| updated_at         | TIMESTAMP, auto                                    | X         | now()         | 수정일시                    | 자동 생성 (Sequelize)       |

**인덱스**: email(unique), center_id, team_id, position, role, status, center_id+position

---

### Center (센터)

**목적**: 헬스장 센터(지점) 정보 관리

| 컬럼명         | 데이터 타입                        | NULL 허용 | 기본값 | 설명            | 필요 이유/비고              |
| -------------- | ---------------------------------- | --------- | ------ | --------------- | --------------------------- |
| id             | INTEGER, autoIncrement, PK         | X         |        | 센터 고유 ID    | 중복 없는 식별자, FK 연결용 |
| name           | VARCHAR(100)                       | X         |        | 센터명          | 센터 구분, 소통에 필요      |
| address        | TEXT                               | X         |        | 센터 주소       | 위치 정보, 고객 안내용      |
| phone          | VARCHAR(20)                        | X         |        | 센터 연락처     | 고객 문의, 업무 연락용      |
| description    | TEXT                               | O         |        | 센터 설명/소개  | 고객에게 센터 정보 제공     |
| weekday_hours  | VARCHAR(50)                        | O         |        | 평일 운영시간   | 고객 안내, 운영 관리        |
| saturday_hours | VARCHAR(50)                        | O         |        | 토요일 운영시간 | 고객 안내, 운영 관리        |
| sunday_hours   | VARCHAR(50)                        | O         |        | 일요일 운영시간 | 고객 안내, 운영 관리        |
| holiday_hours  | VARCHAR(50)                        | O         |        | 공휴일 운영시간 | 고객 안내, 운영 관리        |
| has_parking    | BOOLEAN                            | X         | false  | 주차 가능 여부  | 고객 편의 정보              |
| parking_fee    | VARCHAR(50)                        | O         |        | 주차 요금       | 고객 안내                   |
| parking_info   | TEXT                               | O         |        | 상세 주차 정보  | 고객 안내                   |
| directions     | VARCHAR(200)                       | O         |        | 찾아가는 길     | 고객 안내                   |
| status         | ENUM('active','inactive','closed') | X         | active | 센터 상태       | 운영/휴점/폐점 상태 관리    |
| created_at     | TIMESTAMP, auto                    | X         | now()  | 생성일시        | 자동 생성 (Sequelize)       |
| updated_at     | TIMESTAMP, auto                    | X         | now()  | 수정일시        | 자동 생성 (Sequelize)       |

**인덱스**: status

---

### CenterImage (센터 이미지)

**목적**: 센터별 다중 이미지 관리

| 컬럼명     | 데이터 타입                | NULL 허용 | 기본값 | 설명                 | 필요 이유/비고          |
| ---------- | -------------------------- | --------- | ------ | -------------------- | ----------------------- |
| id         | INTEGER, autoIncrement, PK | X         |        | 이미지 고유 ID       | 중복 없는 식별자        |
| center_id  | INTEGER, FK                | X         |        | 센터 ID (Center FK)  | 센터와의 관계           |
| image_name | VARCHAR(255)               | X         |        | 이미지 원본 파일명   | 파일명 표시, 다운로드용 |
| image_url  | VARCHAR(500)               | X         |        | 이미지 저장 경로/URL | 파일 접근 경로          |
| is_main    | BOOLEAN                    | X         | false  | 대표 이미지 여부     | 센터 대표 사진 지정     |
| sort_order | INTEGER                    | X         | 0      | 정렬 순서            | 이미지 표시 순서 관리   |
| created_at | TIMESTAMP, auto            | X         | now()  | 생성일시             | 자동 생성 (Sequelize)   |
| updated_at | TIMESTAMP, auto            | X         | now()  | 수정일시             | 자동 생성 (Sequelize)   |

**인덱스**: center_id, is_main

---

### Team (팀)

**목적**: 트레이너 팀 관리

| 컬럼명     | 데이터 타입                | NULL 허용 | 기본값 | 설명              | 필요 이유/비고              |
| ---------- | -------------------------- | --------- | ------ | ----------------- | --------------------------- |
| id         | INTEGER, autoIncrement, PK | X         |        | 팀 고유 ID        | 중복 없는 식별자, FK 연결용 |
| name       | VARCHAR(50)                | X         |        | 팀명              | 팀 구분, 소통에 필요        |
| center_id  | INTEGER, FK                | X         |        | 소속 센터 ID      | 센터별 팀 관리, 데이터 구분 |
| leader_id  | INTEGER, FK                | O         |        | 팀장 ID (User FK) | 팀장 지정, 권한 관리        |
| created_at | TIMESTAMP, auto            | X         | now()  | 생성일시          | 자동 생성 (Sequelize)       |
| updated_at | TIMESTAMP, auto            | X         | now()  | 수정일시          | 자동 생성 (Sequelize)       |

**인덱스**: center_id, leader_id

---

### Member (회원)

**목적**: PT 회원 정보 및 세션 관리

| 컬럼명         | 데이터 타입                                     | NULL 허용 | 기본값 | 설명                       | 필요 이유/비고              |
| -------------- | ----------------------------------------------- | --------- | ------ | -------------------------- | --------------------------- |
| id             | INTEGER, autoIncrement, PK                      | X         |        | 회원 고유 ID               | 중복 없는 식별자, FK 연결용 |
| name           | VARCHAR(100)                                    | X         |        | 회원 이름                  | 기본 정보, 소통에 필요      |
| phone          | VARCHAR(20)                                     | X         |        | 연락처                     | 기본 연락 수단              |
| center_id      | INTEGER, FK                                     | X         |        | 등록 센터 ID               | 센터별 회원 관리            |
| trainer_id     | INTEGER, FK                                     | X         |        | 담당 트레이너 ID (User FK) | PT 관리, 정산용             |
| join_date      | DATEONLY                                        | X         |        | 등록일                     | 회원 관리 기준일            |
| expire_date    | DATEONLY                                        | O         |        | 만료일                     | 이용권 만료 관리            |
| total_sessions | INTEGER                                         | X         | 0      | 총 PT 횟수                 | 이용권 총 횟수              |
| used_sessions  | INTEGER                                         | X         | 0      | 사용한 PT 횟수             | 남은 횟수 계산용            |
| free_sessions  | INTEGER                                         | X         | 0      | 무료 PT 횟수               | 무료권 카운팅, 정산용       |
| memo           | TEXT                                            | O         |        | 기타 사항                  | 응급연락처, 특이사항 등     |
| status         | ENUM('active','inactive','expired','withdrawn') | X         | active | 회원 상태                  | 회원 관리                   |
| created_at     | TIMESTAMP, auto                                 | X         | now()  | 생성일시                   | 자동 생성 (Sequelize)       |
| updated_at     | TIMESTAMP, auto                                 | X         | now()  | 수정일시                   | 자동 생성 (Sequelize)       |

**인덱스**: trainer_id, center_id, status, trainer_id+status

---

### Payment (결제)

**목적**: PT 패키지 결제 관리

| 컬럼명         | 데이터 타입                | NULL 허용 | 기본값 | 설명             | 필요 이유/비고          |
| -------------- | -------------------------- | --------- | ------ | ---------------- | ----------------------- |
| id             | INTEGER, autoIncrement, PK | X         |        | 결제 고유 ID     | 중복 없는 식별자        |
| member_id      | INTEGER, FK                | X         |        | 회원 ID          | PT 받는 회원            |
| trainer_id     | INTEGER, FK                | X         |        | 담당 트레이너 ID | 매출 귀속 트레이너      |
| center_id      | INTEGER, FK                | X         |        | 센터 ID          | 센터별 매출 관리        |
| payment_amount | INTEGER                    | X         |        | 결제 금액        | 550,000원, 600,000원 등 |
| session_count  | INTEGER                    | X         |        | 구매한 PT 횟수   | 10회, 20회 등           |
| session_price  | INTEGER                    | X         |        | PT 1회당 가격    | 55,000원~70,000원       |
| payment_date   | DATEONLY                   | X         |        | 결제일           | 매출 집계 기준일        |
| payment_method | VARCHAR(50)                | X         |        | 결제 방법        | 카드, 현금, 계좌이체 등 |
| notes          | TEXT                       | O         |        | 비고             | 특이사항, 메모          |
| created_at     | TIMESTAMP, auto            | X         | now()  | 생성일시         | 자동 생성 (Sequelize)   |
| updated_at     | TIMESTAMP, auto            | X         | now()  | 수정일시         | 자동 생성 (Sequelize)   |

**인덱스**: trainer_id, member_id, center_id, payment_date, trainer_id+payment_date

---

### PTSession (PT 세션)

**목적**: PT 출결 및 세션 기록

| 컬럼명         | 데이터 타입                | NULL 허용 | 기본값  | 설명             | 필요 이유/비고               |
| -------------- | -------------------------- | --------- | ------- | ---------------- | ---------------------------- |
| id             | INTEGER, autoIncrement, PK | X         |         | PT 세션 고유 ID  | 중복 없는 식별자             |
| member_id      | INTEGER, FK                | X         |         | 회원 ID          | PT 받는 회원                 |
| trainer_id     | INTEGER, FK                | X         |         | 담당 트레이너 ID | PT 진행 트레이너 (이력 보존) |
| center_id      | INTEGER, FK                | X         |         | 센터 ID          | PT 진행 센터 (이력 보존)     |
| session_date   | DATEONLY                   | X         |         | PT 날짜          | 출결 관리 기준일             |
| start_time     | TIME                       | X         |         | 시작 시간        | PT 시작 시점                 |
| end_time       | TIME                       | O         |         | 종료 시간        | PT 종료 시점                 |
| session_type   | ENUM('regular','free')     | X         | regular | PT 종류          | 정상 PT / 무료 PT 구분       |
| signature_data | TEXT                       | X         |         | 전자서명 데이터  | 법적 증거, 출결 확인         |
| signature_time | TIMESTAMP                  | X         |         | 서명 시간        | 서명 시점 기록               |
| notes          | TEXT                       | O         |         | PT 내용 메모     | 트레이너 메모, 특이사항      |
| created_at     | TIMESTAMP, auto            | X         | now()   | 생성일시         | 자동 생성 (Sequelize)        |
| updated_at     | TIMESTAMP, auto            | X         | now()   | 수정일시         | 자동 생성 (Sequelize)        |

**인덱스**: session_date, trainer_id, member_id, center_id, trainer_id+session_date, member_id+session_date

---

### Notice (공지사항)

**목적**: 시스템 공지사항 관리

| 컬럼명          | 데이터 타입                    | NULL 허용 | 기본값 | 설명                | 필요 이유/비고         |
| --------------- | ------------------------------ | --------- | ------ | ------------------- | ---------------------- |
| id              | INTEGER, autoIncrement, PK     | X         |        | 공지사항 고유 ID    | 중복 없는 식별자       |
| sender_id       | INTEGER, FK                    | X         |        | 작성자 ID (User FK) | 작성자 추적            |
| receiver_type   | ENUM('all','staff','customer') | X         |        | 수신 대상           | 공지 대상 구분         |
| title           | VARCHAR(200)                   | X         |        | 공지 제목           | 공지 요약              |
| content         | TEXT                           | X         |        | 공지 내용           | 상세 내용              |
| attachment_name | VARCHAR(255)                   | O         |        | 첨부파일 원본명     | 파일 다운로드시 표시명 |
| attachment_url  | VARCHAR(500)                   | O         |        | 첨부파일 저장 경로  | 파일 접근 URL          |
| created_at      | TIMESTAMP, auto                | X         | now()  | 생성일시            | 자동 생성 (Sequelize)  |
| updated_at      | TIMESTAMP, auto                | X         | now()  | 수정일시            | 자동 생성 (Sequelize)  |

**인덱스**: sender_id, receiver_type, created_at

---

### BaseSalary (기본급)

**목적**: 직책별 기본급 정책 관리

| 컬럼명         | 데이터 타입                                        | NULL 허용 | 기본값 | 설명           | 필요 이유/비고        |
| -------------- | -------------------------------------------------- | --------- | ------ | -------------- | --------------------- |
| id             | INTEGER, autoIncrement, PK                         | X         |        | 기본급 정책 ID | 중복 없는 식별자      |
| position       | ENUM('center_manager','team_leader','team_member') | X         |        | 직책           | 직책별 기본급 구분    |
| base_amount    | INTEGER                                            | X         |        | 기본급 금액    | 월 기본급 (원)        |
| effective_date | DATEONLY                                           | X         |        | 시행일         | 정책 적용 시작일      |
| created_at     | TIMESTAMP, auto                                    | X         | now()  | 생성일시       | 자동 생성 (Sequelize) |
| updated_at     | TIMESTAMP, auto                                    | X         | now()  | 수정일시       | 자동 생성 (Sequelize) |

**인덱스**: position, effective_date

---

### CommissionRate (수수료율)

**목적**: 매출 구간별 수수료 정책 관리

| 컬럼명                 | 데이터 타입     | NULL 허용 | 기본값 | 설명                             | 예시                          |
| ---------------------- | --------------- | --------- | ------ | -------------------------------- | ----------------------------- |
| id                     | INTEGER, PK, AI | X         |        | 커미션 정책 ID                   | 1, 2, 3...                    |
| min_revenue            | INTEGER         | X         |        | 최소 매출 (개인 트레이너 월매출) | 5,000,000 (500만원)           |
| max_revenue            | INTEGER         | O         |        | 최대 매출 (null=상한없음)        | 8,000,000 (800만원) 또는 null |
| commission_per_session | INTEGER         | X         |        | PT 1회당 수수료                  | 25,000 (2만5천원)             |
| monthly_commission     | INTEGER         | X         | 0      | 월별 추가 보너스 커미션          | 100,000 (10만원 보너스)       |
| effective_date         | DATEONLY        | X         |        | 정책 시행일                      | 2024-01-01                    |
| created_at             | TIMESTAMP, auto | X         | now()  | 생성일시                         | 자동 생성 (Sequelize)         |
| updated_at             | TIMESTAMP, auto | X         | now()  | 수정일시                         | 자동 생성 (Sequelize)         |

**인덱스**: min_revenue, max_revenue, effective_date

---

### MonthlySettlement (월별 정산)

**목적**: 트레이너 월별 급여 정산 결과 저장

| 컬럼명              | 데이터 타입                      | NULL 허용 | 기본값 | 설명                    | 필요 이유/비고           |
| ------------------- | -------------------------------- | --------- | ------ | ----------------------- | ------------------------ |
| id                  | INTEGER, autoIncrement, PK       | X         |        | 정산 고유 ID            | 중복 없는 식별자         |
| user_id             | INTEGER, FK                      | X         |        | 직원 ID (User FK)       | 정산 대상 직원           |
| center_id           | INTEGER, FK                      | X         |        | 센터 ID                 | 센터별 정산 관리         |
| settlement_year     | INTEGER                          | X         |        | 정산 연도               | 2024                     |
| settlement_month    | INTEGER                          | X         |        | 정산 월                 | 1~12                     |
| actual_revenue      | INTEGER                          | X         | 0      | 당월 실제 매출          | 해당 월 발생 매출        |
| carryover_from_prev | INTEGER                          | X         | 0      | 전월 이월 매출          | 커미션 구간 계산용       |
| total_revenue       | INTEGER                          | X         | 0      | 총 매출 (실제+이월)     | 커미션 구간 판단 기준    |
| settlement_revenue  | INTEGER                          | X         | 0      | 정산에 반영된 매출      | 실제 사용된 매출         |
| remaining_amount    | INTEGER                          | X         | 0      | 다음달 이월 금액        | 미사용 이월 매출         |
| base_salary         | INTEGER                          | X         | 0      | 기본급                  | 직책별 고정 급여         |
| regular_pt_count    | INTEGER                          | X         | 0      | 정상 PT 횟수            | 유료 PT 세션 수          |
| free_pt_count       | INTEGER                          | X         | 0      | 무료 PT 횟수            | 무료/서비스 PT 세션 수   |
| pt_commission_total | INTEGER                          | X         | 0      | PT 수수료 총액          | PT 횟수별 수수료 합계    |
| monthly_commission  | INTEGER                          | X         | 0      | 월별 커미션             | 매출 구간별 보너스       |
| team_pt_incentive   | INTEGER                          | X         | 0      | 팀 PT 인센티브 (팀장만) | 팀원 PT 매출의 일정 비율 |
| bonus               | INTEGER                          | X         | 0      | 기타 보너스             | 성과급, 특별 보너스 등   |
| total_settlement    | INTEGER                          | X         | 0      | 총 정산 금액            | 모든 항목 합계           |
| status              | ENUM('draft','confirmed','paid') | X         | draft  | 정산 상태               | 초안/확정/지급완료       |
| notes               | TEXT                             | O         |        | 정산 메모               | 특이사항, 조정 내역 등   |
| created_at          | TIMESTAMP, auto                  | X         | now()  | 생성일시                | 자동 생성 (Sequelize)    |
| updated_at          | TIMESTAMP, auto                  | X         | now()  | 수정일시                | 자동 생성 (Sequelize)    |

**인덱스**: user_id, center_id, settlement_year+settlement_month, user_id+settlement_year+settlement_month, status

---

## 📈 데이터베이스 성능 최적화

### 인덱스 전략

- **FK 컬럼**: 모든 외래키에 인덱스 적용
- **검색 컬럼**: 자주 조회되는 상태, 날짜 컬럼
- **복합 인덱스**: 함께 조회되는 컬럼 조합
- **유니크 인덱스**: 중복 방지가 필요한 컬럼

### 관계 설정

- **1:N 관계**: hasMany, belongsTo 사용
- **FK 제약조건**: 데이터 무결성 보장
- **Cascade 설정**: 참조 데이터 자동 관리

---

## 🔧 개발 참고사항

### 환경 설정

```bash
# 데이터베이스 연결 테스트
npm run test:db

# 마이그레이션 실행
npx sequelize-cli db:migrate

# 시드 데이터 입력
npx sequelize-cli db:seed:all
```

### 모델 사용 예시

```javascript
// 관계를 포함한 조회
const user = await User.findByPk(1, {
  include: [
    { model: Center, as: "center" },
    { model: Team, as: "team" },
    { model: Member, as: "members" },
  ],
});

// 정산 계산
const settlement = await MonthlySettlement.findOne({
  where: {
    user_id: userId,
    settlement_year: 2024,
    settlement_month: 12,
  },
});
```

---

**마지막 업데이트**: 2024-12-19  
**버전**: 1.0.0
