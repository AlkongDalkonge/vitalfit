# VitalFit Frontend

VitalFit 프로젝트의 프론트엔드 애플리케이션입니다.

## 프로젝트 가이드

- **CONTRIBUTING.md**: 코드 컨벤션과 커밋 메시지 규칙
- **API_SPEC.md**: 백엔드 API 명세서 예시
- **.env.example**: 환경변수 설정 예시

## 환경변수 설정

프로젝트를 처음 클론한 후, 환경변수 파일을 생성하세요:

```bash
cp .env.example .env
```

.env 파일에 실제 API 서버 주소 등을 입력해야 정상 동작합니다.

## Git 명령어 실행 방법

### 1. 변경사항 확인 (선택)

```bash
git status
```

어떤 파일이 변경되었는지 확인

### 2. 파일 추가 (스테이징, 파일만 올릴경우 . 대신 파일명넣음)

```bash
git add .
```

모든 변경사항을 스테이징 영역에 추가

### 3. 커밋

```bash
git commit -m "[타입] 설명"
```

변경사항을 커밋 (커밋 메시지 규칙은 CONTRIBUTING.md 참고)

### 4. 원격 저장소에 푸시

```bash
git push origin main
```

로컬 커밋을 원격 저장소에 업로드

### 한 번에 실행하는 방법

```bash
git add .
git commit -m "[Refactor] 프로젝트 구조 정리 및 팀 협업 가이드 추가"
git push origin main
```

## 코드 컨벤션 및 커밋 규칙

- **코드 컨벤션**: 파일명, 컴포넌트명, 함수명 등 코딩 스타일 규칙
- **커밋 메시지 규칙**: [타입] 설명 형식의 커밋 메시지 작성법

자세한 내용은 **CONTRIBUTING.md** 파일을 참고하세요.

## 실행 방법

### 개발 서버 실행

```bash
npm start
```

브라우저에서 [http://localhost:3000]으로 접속하세요.

### 기타 명령어 (필요시)

```bash
npm run build  # 배포용 빌드
npm test       # 테스트 실행
```

## 폴더 구조

```
vitalfit-frontend/
│
├─ public/ # 정적 파일(HTML, 이미지, favicon 등)
│ └─ index.html
│
├─ src/ # 소스코드 메인 폴더
│ ├─ assets/ # 이미지, 폰트, 아이콘 등 정적 리소스
│ ├─ components/ # 재사용 가능한 UI 컴포넌트들 (Button, Modal 등)
│ ├─ pages/ # 페이지 단위 컴포넌트 (로그인페이지, 대시보드 등)
│ ├─ hooks/ # 커스텀 훅 (useAuth, useFetch 등)
│ ├─ contexts/ # React Context API 관련 코드
│ ├─ services/ # API 요청 함수들, 외부 서비스 연동 코드
│ ├─ utils/ # 유틸 함수 모음
│ ├─ styles/ # 전역 스타일, 변수, 믹스인 (CSS, SCSS)
│ ├─ router/ # React Router 설정 파일
│ ├─ App.js # 최상위 컴포넌트
│ └─ index.js # 진입점 (렌더링)
│
├─ .gitignore
├─ package.json
├─ README.md
├─ CONTRIBUTING.md # 코드 컨벤션/커밋 규칙
├─ API_SPEC.md # API 명세서
└─ .env.example # 환경변수 예시
```

## 기술 스택

- React
- Create React App
- JavaScript/JSX
- CSS/SCSS

## 팀 협업 규칙

- .env 파일은 절대 공유 금지
- PR은 리뷰 후 병합
- 코드 컨벤션은 CONTRIBUTING.md 참고

---
