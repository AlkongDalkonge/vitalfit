// 에러 처리 미들웨어
module.exports = (err, req, res, next) => {
  console.error(err.stack); // 서버 콘솔에 에러 스택 출력

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "서버 내부 오류가 발생했습니다.",
    // 필요하면 개발 중에만 에러 상세정보도 함께 볼수있음
    details: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
