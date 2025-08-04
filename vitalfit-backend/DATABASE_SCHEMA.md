# 🗄️ 데이터베이스 스키마 명세서

VitalFit 프로젝트의 데이터베이스 테이블 구조 및 관계를 정의합니다.

## 📋 목차

1. [테이블 관계도](#테이블-관계도)
2. [테이블 명세서](#테이블-명세서)
   - [Position (직급)](#position-직급)
   - [User (직원)](#user-직원)
   - [Center (센터)](#center-센터)
   - [CenterImage (센터 이미지)](#centerimage-센터-이미지)
   - [Team (팀)](#team-팀)
   - [Member (회원)](#member-회원)
   - [Payment (결제)](#payment-결제)
   - [PTSession (PT 세션)](#ptsession-pt-세션)
   - [Notice (공지사항)](#notice-공지사항)
   - [NoticeTargetCenter (공지 대상 센터)](#noticetargetcenter-공지-대상-센터)
   - [NoticeTargetRole (공지 대상 역할)](#noticetargetrole-공지-대상-역할)
   - [CommissionRate (수수료율)](#commissionrate-수수료율)
   - [BonusRule (보너스 규칙)](#bonusrule-보너스-규칙)
   - [MonthlySettlement (월별 정산)](#monthlysettlement-월별-정산)

---

## 🔗 테이블 관계도

```
Position (1) ──── (N) User

Center (1) ──── (N) CenterImage
Center (1) ──── (N) Team
Center (1) ──── (N) User
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

Notice (1) ──── (N) NoticeTargetCenter
Notice (1) ──── (N) NoticeTargetRole
NoticeTargetCenter (N) ──── (1) Center

Member (1) ──── (N) Payment
Member (1) ──── (N) PTSession

Center (1) ──── (N) CommissionRate
Position (1) ──── (N) CommissionRate
BonusRule (독립 테이블)
```

---

## 📊 테이블 명세서

### Position (직급)

**목적**: 직급별 정보 및 기본급 관리 (기존 RoleCode + BaseSalary 통합)

| 컬럼명         | 데이터 타입            | 키 타입 | 참조 테이블 | NULL | 기본값 | 설명         | 필요 이유/비고                       |
| -------------- | ---------------------- | ------- | ----------- | ---- | ------ | ------------ | ------------------------------------ |
| id             | INTEGER, autoIncrement | PK      |             | X    |        | 직급 고유 ID | 중복 없는 식별자, FK 연결용          |
| code           | VARCHAR(50)            | UNIQUE  |             | X    |        | 직급 코드    | 영문 직급 코드 (trainee, trainer 등) |
| name           | VARCHAR(50)            |         |             | X    |        | 직급명       | 한글 직급명 (연습생, 트레이너 등)    |
| level          | INTEGER                |         |             | X    |        | 직급 레벨    | 권한 레벨 구분 (1=연습생, 11=센터장) |
| base_salary    | INTEGER                |         |             | X    |        | 기본급       | 직급별 고정 기본급(영업지원금)       |
| effective_date | DATE                   |         |             | X    |        | 적용일       | 해당 급여 정책 시작일                |
| description    | VARCHAR(200)           |         |             | O    |        | 직급 설명    | 직급에 대한 상세 설명                |
| is_active      | BOOLEAN                |         |             | X    | true   | 활성 상태    | 현재 사용중인 직급 여부              |
| created_at     | TIMESTAMP              |         |             | X    | now()  | 생성일시     | 자동 생성 (Sequelize)                |
| updated_at     | TIMESTAMP              |         |             | X    | now()  | 수정일시     | 자동 생성 (Sequelize)                |

**인덱스**: code(unique), level, is_active

---

### User (직원)

**목적**: 직원(트레이너, 매니저, 관리자) 정보 관리

| 컬럼명             | 데이터 타입                         | NULL 허용 | 기본값 | 설명                        | 필요 이유/비고               |
| ------------------ | ----------------------------------- | --------- | ------ | --------------------------- | ---------------------------- |
| id                 | INTEGER, autoIncrement, PK          | X         |        | 고유 사용자 ID              | 중복 없는 식별자, FK 연결용  |
| name               | VARCHAR(100)                        | X         |        | 사용자 이름                 | 기본 정보, 소통에 필요       |
| email              | VARCHAR(255), unique, isEmail       | X         |        | 로그인용 이메일             | 로그인 ID, 중복 방지         |
| password           | VARCHAR(255)                        | X         |        | 암호화된 비밀번호           | 로그인 보안                  |
| phone              | VARCHAR(20), len: 10~20             | X         |        | 휴대폰 번호                 | 2차 인증, 연락처             |
| phone_verified     | BOOLEAN, default: false             | X         | false  | 휴대폰 인증 여부            | 인증 완료 상태 확인          |
| **position_id**    | **INTEGER, FK**                     | **X**     |        | **직급 ID (Position FK)**   | **직급 정보 및 기본급 관리** |
| team_id            | INTEGER, FK                         | O         |        | 소속 팀 ID                  | 팀 단위 업무/권한 관리       |
| center_id          | INTEGER, FK                         | X         |        | 소속 센터 ID                | 센터별 데이터/업무 구분      |
| join_date          | DATEONLY                            | X         |        | 입사일                      | 근무 시작일, 정산/출결 기준  |
| status             | ENUM('active','inactive','retired') | X         | active | 재직 상태                   | 퇴사/휴면 등 권한 관리       |
| leave_date         | DATEONLY                            | O         |        | 퇴사일                      | 실제 퇴사 날짜 기록          |
| profile_image_name | VARCHAR(255)                        | O         |        | 프로필 이미지의 원본 파일명 |                              |
| profile_image_url  | VARCHAR(255)                        | O         |        | 저장된 이미지 경로(URL)     |                              |
| nickname           | VARCHAR(50)                         | O         |        | 별명/닉네임                 | 친근한 이름, 커뮤니케이션    |
| license            | VARCHAR(200)                        | O         |        | 자격증명                    | 강사 자격 증빙, 신뢰 확보    |
| experience         | TEXT                                | O         |        | 경력사항                    | 업무 이력, 전문성 소개       |
| education          | VARCHAR(200)                        | O         |        | 학력                        | 자격 요건, 신뢰성            |
| instagram          | VARCHAR(100)                        | O         |        | 인스타그램 계정             | SNS 연동, 마케팅 활용        |
| last_login_at      | DATE/TIMESTAMP                      | O         |        | 마지막 로그인 시간          | 보안, 활동 기록              |
| login_attempts     | INTEGER, default: 0                 | X         | 0      | 로그인 시도 횟수            | 계정 잠금 등 보안            |
| is_locked          | BOOLEAN, default: false             | X         | false  | 계정 잠금 여부              | 보안, 비정상 접근 차단       |
| created_at         | TIMESTAMP, auto                     | X         | now()  | 생성일시                    | 자동 생성 (Sequelize)        |
| updated_at         | TIMESTAMP, auto                     | X         | now()  | 수정일시                    | 자동 생성 (Sequelize)        |

**인덱스**: email(unique), center_id, team_id, position_id, status

---

### Center (센터)

**목적**: 헬스장 센터(지점) 정보 관리

| 컬럼명           | 데이터 타입                | NULL 허용 | 기본값 | 설명            | 필요 이유/비고              |
| ---------------- | -------------------------- | --------- | ------ | --------------- | --------------------------- |
| id               | INTEGER, autoIncrement, PK | X         |        | 센터 고유 ID    | 중복 없는 식별자, FK 연결용 |
| name             | VARCHAR(100)               | X         |        | 센터명          | 센터 구분, 소통에 필요      |
| address          | TEXT                       | X         |        | 센터 주소       | 위치 정보, 고객 안내용      |
| phone            | VARCHAR(20)                | X         |        | 센터 연락처     | 고객 문의, 업무 연락용      |
| email            | VARCHAR(255)               | O         |        | 센터 이메일     | 공식 연락처                 |
| kakao_id         | VARCHAR(100)               | O         |        | 카카오톡 ID     | SNS 연락처                  |
| instagram        | VARCHAR(100)               | O         |        | 인스타그램      | SNS 마케팅                  |
| store_image_name | VARCHAR(255)               | O         |        | 매장 이미지명   | 매장 사진 파일명            |
| store_image_url  | VARCHAR(255)               | O         |        | 매장 이미지 URL | 매장 사진 경로              |
| business_hours   | VARCHAR(100)               | O         |        | 운영시간        | 고객 안내                   |
| is_active        | BOOLEAN                    | X         | true   | 활성 상태       | 운영/휴점 상태 관리         |
| created_at       | TIMESTAMP, auto            | X         | now()  | 생성일시        | 자동 생성 (Sequelize)       |
| updated_at       | TIMESTAMP, auto            | X         | now()  | 수정일시        | 자동 생성 (Sequelize)       |

**인덱스**: is_active

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

| 컬럼명            | 데이터 타입                                     | NULL 허용 | 기본값 | 설명                       | 필요 이유/비고              |
| ----------------- | ----------------------------------------------- | --------- | ------ | -------------------------- | --------------------------- |
| id                | INTEGER, autoIncrement, PK                      | X         |        | 회원 고유 ID               | 중복 없는 식별자, FK 연결용 |
| name              | VARCHAR(100)                                    | X         |        | 회원 이름                  | 기본 정보, 소통에 필요      |
| email             | VARCHAR(255)                                    | O         |        | 이메일                     | 연락처                      |
| phone             | VARCHAR(20)                                     | X         |        | 연락처                     | 기본 연락 수단              |
| phone_verified    | BOOLEAN                                         | X         | false  | 전화번호 인증 여부         | 인증 상태 관리              |
| birth_date        | DATE                                            | O         |        | 생년월일                   | 나이 계산, 프로그램 구성    |
| gender            | ENUM('male','female')                           | O         |        | 성별                       | 프로그램 구성               |
| center_id         | INTEGER, FK                                     | X         |        | 등록 센터 ID               | 센터별 회원 관리            |
| trainer_id        | INTEGER, FK                                     | X         |        | 담당 트레이너 ID (User FK) | PT 관리, 정산용             |
| join_date         | DATEONLY                                        | X         |        | 등록일                     | 회원 관리 기준일            |
| status            | ENUM('active','inactive','expired','withdrawn') | X         | active | 회원 상태                  | 회원 관리                   |
| emergency_contact | VARCHAR(20)                                     | O         |        | 비상연락처                 | 응급상황 대응               |
| address           | VARCHAR(200)                                    | O         |        | 주소                       | 연락처 정보                 |
| medical_history   | TEXT                                            | O         |        | 병력                       | 안전한 운동 프로그램 구성   |
| goals             | TEXT                                            | O         |        | 운동 목표                  | 맞춤형 프로그램 구성        |
| created_at        | TIMESTAMP, auto                                 | X         | now()  | 생성일시                   | 자동 생성 (Sequelize)       |
| updated_at        | TIMESTAMP, auto                                 | X         | now()  | 수정일시                   | 자동 생성 (Sequelize)       |

**인덱스**: trainer_id, center_id, status, trainer_id+status

---

### Payment (결제)

**목적**: PT 패키지 결제 관리

| 컬럼명         | 데이터 타입                                        | NULL 허용 | 기본값  | 설명             | 필요 이유/비고          |
| -------------- | -------------------------------------------------- | --------- | ------- | ---------------- | ----------------------- |
| id             | INTEGER, autoIncrement, PK                         | X         |         | 결제 고유 ID     | 중복 없는 식별자        |
| member_id      | INTEGER, FK                                        | X         |         | 회원 ID          | PT 받는 회원            |
| trainer_id     | INTEGER, FK                                        | X         |         | 담당 트레이너 ID | 매출 귀속 트레이너      |
| center_id      | INTEGER, FK                                        | X         |         | 센터 ID          | 센터별 매출 관리        |
| product_name   | VARCHAR(100)                                       | X         |         | 상품명           | PT 10회, PT 20회 등     |
| sessions       | INTEGER                                            | X         |         | 구매한 PT 횟수   | 10회, 20회 등           |
| amount         | INTEGER                                            | X         |         | 결제 금액        | 550,000원, 600,000원 등 |
| payment_date   | DATEONLY                                           | X         |         | 결제일           | 매출 집계 기준일        |
| payment_method | VARCHAR(50)                                        | X         |         | 결제 방법        | 카드, 현금, 계좌이체 등 |
| status         | ENUM('pending','completed','cancelled','refunded') | X         | pending | 결제 상태        | 결제 처리 상태 관리     |
| notes          | TEXT                                               | O         |         | 비고             | 특이사항, 메모          |
| created_at     | TIMESTAMP, auto                                    | X         | now()   | 생성일시         | 자동 생성 (Sequelize)   |
| updated_at     | TIMESTAMP, auto                                    | X         | now()   | 수정일시         | 자동 생성 (Sequelize)   |

**인덱스**: trainer_id, member_id, center_id, payment_date, trainer_id+payment_date

---

### PTSession (PT 세션)

**목적**: PT 출결 및 세션 기록

| 컬럼명          | 데이터 타입                                         | NULL 허용 | 기본값    | 설명             | 필요 이유/비고               |
| --------------- | --------------------------------------------------- | --------- | --------- | ---------------- | ---------------------------- |
| id              | INTEGER, autoIncrement, PK                          | X         |           | PT 세션 고유 ID  | 중복 없는 식별자             |
| member_id       | INTEGER, FK                                         | X         |           | 회원 ID          | PT 받는 회원                 |
| trainer_id      | INTEGER, FK                                         | X         |           | 담당 트레이너 ID | PT 진행 트레이너 (이력 보존) |
| payment_id      | INTEGER, FK                                         | O         |           | 결제 ID          | 결제와 세션 연결             |
| center_id       | INTEGER, FK                                         | X         |           | 센터 ID          | PT 진행 센터 (이력 보존)     |
| session_date    | DATEONLY                                            | X         |           | PT 날짜          | 출결 관리 기준일             |
| start_time      | TIME                                                | X         |           | 시작 시간        | PT 시작 시점                 |
| end_time        | TIME                                                | O         |           | 종료 시간        | PT 종료 시점                 |
| status          | ENUM('scheduled','completed','cancelled','no_show') | X         | scheduled | 세션 상태        | 세션 진행 상태 관리          |
| trainer_notes   | TEXT                                                | O         |           | 트레이너 메모    | PT 내용, 특이사항            |
| member_feedback | TEXT                                                | O         |           | 회원 피드백      | 만족도, 의견                 |
| rating          | INTEGER                                             | O         |           | 평점 (1-5)       | 서비스 품질 관리             |
| created_at      | TIMESTAMP, auto                                     | X         | now()     | 생성일시         | 자동 생성 (Sequelize)        |
| updated_at      | TIMESTAMP, auto                                     | X         | now()     | 수정일시         | 자동 생성 (Sequelize)        |

**인덱스**: session_date, trainer_id, member_id, center_id, trainer_id+session_date, member_id+session_date

---

### Notice (공지사항)

**목적**: 시스템 공지사항 관리

| 컬럼명          | 데이터 타입                | NULL 허용 | 기본값 | 설명                | 필요 이유/비고         |
| --------------- | -------------------------- | --------- | ------ | ------------------- | ---------------------- |
| id              | INTEGER, autoIncrement, PK | X         |        | 공지사항 고유 ID    | 중복 없는 식별자       |
| sender_id       | INTEGER, FK                | X         |        | 작성자 ID (User FK) | 작성자 추적            |
| title           | VARCHAR(200)               | X         |        | 공지 제목           | 공지 요약              |
| content         | TEXT                       | X         |        | 공지 내용           | 상세 내용              |
| attachment_name | VARCHAR(255)               | O         |        | 첨부파일 원본명     | 파일 다운로드시 표시명 |
| attachment_url  | VARCHAR(500)               | O         |        | 첨부파일 저장 경로  | 파일 접근 URL          |
| is_important    | BOOLEAN                    | X         | false  | 중요 공지 여부      | 상단 노출, 강조 표시   |
| pin_until       | DATE                       | O         |        | 상단 고정 종료일    | 중요 공지 상단 고정    |
| view_count      | INTEGER                    | X         | 0      | 조회수              | 공지 열람 통계         |
| created_at      | TIMESTAMP, auto            | X         | now()  | 생성일시            | 자동 생성 (Sequelize)  |
| updated_at      | TIMESTAMP, auto            | X         | now()  | 수정일시            | 자동 생성 (Sequelize)  |

**인덱스**: sender_id, created_at, is_important, pin_until

---

### NoticeTargetCenter (공지 대상 센터)

**목적**: 공지사항 수신 대상 센터 관리

| 컬럼명     | 데이터 타입                | 키 타입 | 참조 테이블 | NULL 허용 | 기본값 | 설명              | 필요 이유/비고        |
| ---------- | -------------------------- | ------- | ----------- | --------- | ------ | ----------------- | --------------------- |
| id         | INTEGER, autoIncrement, PK | PK      |             | X         |        | 타겟 센터 지정 ID | 중복 없는 식별자      |
| notice_id  | INTEGER, FK                | FK      | notices     | X         |        | 공지 ID           | 공지와 연결되는 FK    |
| center_id  | INTEGER, FK                | FK      | centers     | X         |        | 지점 ID           | 공지 수신 대상 센터   |
| created_at | TIMESTAMP, auto            |         |             | X         | now()  | 생성일시          | 자동 생성 (Sequelize) |
| updated_at | TIMESTAMP, auto            |         |             | X         | now()  | 수정일시          | 자동 생성 (Sequelize) |

**인덱스**: notice_id, center_id, notice_id+center_id(unique)

---

### NoticeTargetRole (공지 대상 역할)

**목적**: 공지사항 수신 대상 역할 관리

| 컬럼명     | 데이터 타입                                        | 키 타입 | 참조 테이블 | NULL 허용 | 기본값 | 설명              | 필요 이유/비고        |
| ---------- | -------------------------------------------------- | ------- | ----------- | --------- | ------ | ----------------- | --------------------- |
| id         | INTEGER, autoIncrement, PK                         | PK      |             | X         |        | 타겟 역할 지정 ID | 중복 없는 식별자      |
| notice_id  | INTEGER, FK                                        | FK      | notices     | X         |        | 공지 ID           | 공지와 연결되는 FK    |
| role_code  | ENUM('team_member','team_leader','center_manager') |         |             | X         |        | 직책 코드         | 수신 대상 직책 구분   |
| created_at | TIMESTAMP, auto                                    |         |             | X         | now()  | 생성일시          | 자동 생성 (Sequelize) |
| updated_at | TIMESTAMP, auto                                    |         |             | X         | now()  | 수정일시          | 자동 생성 (Sequelize) |

**인덱스**: notice_id, role_code, notice_id+role_code(unique)

---

### CommissionRate (수수료율)

**목적**: 매출별 커미션 비율 관리 (지점별, 직급별 차별화 정책 지원)

| 컬럼명                 | 데이터 타입                | 키 타입 | 참조 테이블 | NULL 허용 | 기본값 | 설명                | 필요 이유/비고                 |
| ---------------------- | -------------------------- | ------- | ----------- | --------- | ------ | ------------------- | ------------------------------ |
| id                     | INTEGER, autoIncrement, PK | PK      |             | X         |        | 커미션 정책 고유 ID | 중복 없는 식별자               |
| min_revenue            | INTEGER                    |         |             | X         |        | 최소 매출액         | 구간별 정책 적용               |
| max_revenue            | INTEGER                    |         |             | O         |        | 최대 매출액         | 상한 없는 구간은 NULL          |
| commission_per_session | INTEGER                    |         |             | X         |        | 회당 커미션         | 세션별 수수료                  |
| monthly_commission     | INTEGER                    |         |             | X         | 0      | 월 고정 커미션      | 고매출 달성 시 추가 보상       |
| effective_date         | DATE                       |         |             | X         |        | 정책 적용 시작일    | 정책 변경 이력 관리            |
| center_id              | INTEGER, FK                | FK      | centers     | O         |        | 지점 ID             | 지점별 차별화 정책 (NULL=전체) |
| position_id            | INTEGER, FK                | FK      | positions   | O         |        | 직급 ID             | 직급별 차별화 정책 (NULL=전체) |
| is_active              | BOOLEAN                    |         |             | X         | true   | 정책 활성화 상태    | 정책 사용 여부 구분            |
| description            | TEXT                       |         |             | O         |        | 정책 설명           | 어드민을 위한 정책 설명        |
| created_at             | TIMESTAMP, auto            |         |             | X         | now()  | 생성일시            | 자동 생성 (Sequelize)          |
| updated_at             | TIMESTAMP, auto            |         |             | X         | now()  | 수정일시            | 자동 생성 (Sequelize)          |

**인덱스**: min_revenue+max_revenue, center_id, position_id, is_active, effective_date, center_id+position_id+effective_date

---

### BonusRule (보너스 규칙)

**목적**: 성과 보너스 규칙 관리

| 컬럼명            | 데이터 타입            | 키 타입 | 참조 테이블 | NULL | 기본값 | 설명           | 필요 이유/비고                |
| ----------------- | ---------------------- | ------- | ----------- | ---- | ------ | -------------- | ----------------------------- |
| id                | INTEGER, autoIncrement | PK      |             | X    |        | 룰 고유 ID     | 중복 없는 식별자              |
| name              | VARCHAR(100)           |         |             | X    |        | 룰 이름        | 예: "주 500만 2회, 11일 이전" |
| target_type       | ENUM('daily','weekly') |         |             | X    |        | 기준 단위      | 일/주 단위 구분               |
| threshold_amount  | INTEGER                |         |             | X    |        | 기준 매출      | 300만/500만 등 (원 단위)      |
| achievement_count | INTEGER                |         |             | X    |        | 달성 횟수      | 몇 번째 달성인지              |
| bonus_amount      | INTEGER                |         |             | X    |        | 지급할 금액    | 보너스 금액 (원 단위)         |
| before_11days     | ENUM('Y','N')          |         |             | X    | 'N'    | 11일 이전 조건 | Y=11일 이전, N=일반           |
| created_at        | TIMESTAMP              |         |             | X    | now()  | 생성일시       | 자동 생성                     |
| updated_at        | TIMESTAMP              |         |             | X    | now()  | 수정일시       | 자동 생성                     |

**인덱스**: target_type, threshold_amount, before_11days

---

### MonthlySettlement (월별 정산)

**목적**: 트레이너 월별 급여 정산 결과 저장

| 컬럼명              | 데이터 타입                                                                                                 | NULL 허용 | 기본값 | 설명                    | 필요 이유/비고                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------- | --------- | ------ | ----------------------- | ---------------------------------------------------- |
| id                  | INTEGER, autoIncrement, PK                                                                                  | X         |        | 정산 고유 ID            | 중복 없는 식별자                                     |
| user_id             | INTEGER, FK                                                                                                 | X         |        | 직원 ID (User FK)       | 정산 대상 직원                                       |
| center_id           | INTEGER, FK                                                                                                 | X         |        | 센터 ID                 | 센터별 정산 관리                                     |
| settlement_year     | INTEGER                                                                                                     | X         |        | 정산 연도               | 2024                                                 |
| settlement_month    | INTEGER                                                                                                     | X         |        | 정산 월                 | 1~12                                                 |
| actual_revenue      | INTEGER                                                                                                     | X         | 0      | 당월 실제 매출          | 해당 월 발생 매출                                    |
| carryover_from_prev | INTEGER                                                                                                     | X         | 0      | 전월 이월 매출          | 커미션 구간 계산용                                   |
| total_revenue       | INTEGER                                                                                                     | X         | 0      | 총 매출 (실제+이월)     | 커미션 구간 판단 기준                                |
| settlement_revenue  | INTEGER                                                                                                     | X         | 0      | 정산에 반영된 매출      | 실제 사용된 매출                                     |
| remaining_amount    | INTEGER                                                                                                     | X         | 0      | 다음달 이월 금액        | 미사용 이월 매출                                     |
| base_salary         | INTEGER                                                                                                     | X         | 0      | 기본급                  | 직책별 고정 급여                                     |
| regular_pt_count    | INTEGER                                                                                                     | X         | 0      | 정상 PT 횟수            | 유료 PT 세션 수                                      |
| free_pt_count       | INTEGER                                                                                                     | X         | 0      | 무료 PT 횟수            | 무료/서비스 PT 세션 수                               |
| pt_commission_total | INTEGER                                                                                                     | X         | 0      | PT 수수료 총액          | PT 횟수별 수수료 합계                                |
| monthly_commission  | INTEGER                                                                                                     | X         | 0      | 월별 커미션             | 매출 구간별 보너스                                   |
| team_pt_incentive   | INTEGER                                                                                                     | X         | 0      | 팀 PT 인센티브 (팀장만) | 팀원 PT 매출의 일정 비율                             |
| bonus               | INTEGER                                                                                                     | X         | 0      | 기타 보너스             | 성과급, 특별 보너스 등                               |
| total_settlement    | INTEGER                                                                                                     | X         | 0      | 총 정산 금액            | 모든 항목 합계                                       |
| status              | ENUM('draft','team_leader_approved','center_manager_approved','ceo_approved','paid','rejected','cancelled') | X         | draft  | 정산 상태               | 초안/팀장승인/지점장승인/대표승인/지급완료/반려/취소 |
| notes               | TEXT                                                                                                        | O         |        | 정산 메모               | 특이사항, 조정 내역 등                               |
| created_at          | TIMESTAMP, auto                                                                                             | X         | now()  | 생성일시                | 자동 생성 (Sequelize)                                |
| updated_at          | TIMESTAMP, auto                                                                                             | X         | now()  | 수정일시                | 자동 생성 (Sequelize)                                |

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
node -e "require('./src/models/seedData.js').seedAllData()"
```

### 모델 사용 예시

```javascript
// 관계를 포함한 조회 (업데이트된 구조)
const user = await User.findByPk(1, {
  include: [
    { model: Position, as: 'position' },
    { model: Center, as: 'center' },
    { model: Team, as: 'team' },
    { model: Member, as: 'members' },
  ],
});

// 커미션 계산을 위한 조회
const commissionRate = await CommissionRate.findOne({
  where: {
    min_revenue: { [Op.lte]: monthlyRevenue },
    [Op.or]: [{ max_revenue: { [Op.gte]: monthlyRevenue } }, { max_revenue: null }],
  },
});

// 보너스 규칙 조회
const bonusRules = await BonusRule.findAll({
  where: {
    target_type: 'weekly',
    threshold_amount: { [Op.lte]: weeklyRevenue },
  },
});
```

---

## 🔄 주요 변경사항 (v2.0)

### ✅ 테이블 통합

- **BaseSalary + RoleCode → Position**: 직급과 기본급을 하나의 테이블로 통합
- **데이터 중복 제거**: 관리 포인트 단순화

### ✅ User 테이블 개선

- **role, position → position_id**: Position 테이블과 FK 관계 설정
- **체계적인 직급 관리**: level 기반 권한 체계

### ✅ 새로운 테이블 추가

- **BonusRule**: 성과 보너스 규칙 체계적 관리
- **11일 이전 조건**: 조기 달성 인센티브 지원

### ✅ CommissionRate 개선

- **구간 관리 개선**: 깔끔한 min/max 설정
- **무제한 구간**: max_revenue NULL로 상한 없는 구간 지원

---

**마지막 업데이트**: 2024-12-20  
**버전**: 2.0.0
