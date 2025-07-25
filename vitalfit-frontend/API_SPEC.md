# API 명세서 예시

## 1. 공지사항 목록 조회

- URL: GET /notice/notices
- 설명: 모든 공지사항 목록을 조회합니다.
- 응답 예시:

```
[
  {
    "id": 1,
    "title": "공지 제목",
    "content": "공지 내용",
    "sender": "관리자",
    "receiver": "전체",
    "noticeType": "일반",
    "createdAt": "2024-06-01T12:00:00.000Z"
  }
]
```

## 2. 공지사항 등록

- URL: POST /notice/notices
- 설명: 새로운 공지사항을 등록합니다.
- 요청 예시:

```
{
  "title": "공지 제목",
  "content": "공지 내용",
  "sender": "관리자",
  "receiver": "전체",
  "noticeType": "일반"
}
```

- 응답 예시:

```
{
  "id": 2,
  "title": "공지 제목",
  "content": "공지 내용",
  "sender": "관리자",
  "receiver": "전체",
  "noticeType": "일반",
  "createdAt": "2024-06-01T12:00:00.000Z"
}
```

---

※ 실제 프로젝트에 맞게 API URL, 요청/응답 예시를 추가/수정해 주세요.
