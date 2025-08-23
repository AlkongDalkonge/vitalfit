const cron = require('node-cron');
const { publishMonthlySettlements } = require('../services/settlementPublisher');

// 서버 시작 시 한 번 실행
(async () => {
  if (process.env.SCHEDULER_ENABLED === 'true') {
    const forced = process.env.FORCE_PERIOD || null;
    try {
      console.log('[startup] publishing settlements...', forced ?? '(auto prev month)');
      const result = await publishMonthlySettlements(forced);
      if (result.status === 'completed') {
        console.log(`[startup] job completed: ${result.periodYm}, processed: ${result.upserted} records`);
      } else {
        console.log(`[startup] job skipped: ${result.periodYm}`);
      }
    } catch (e) {
      console.error('[startup] job failed:', e?.message || e);
    }
  }
})();

// 환경에 따른 스케줄 설정
const cronSchedule = process.env.NODE_ENV === 'production' 
  ? '0 9 1 * *'  // 상용: 매월 1일 09:00
  : '0 * * * *'; // 개발: 매시간

cron.schedule(cronSchedule, async () => {
  if (process.env.SCHEDULER_ENABLED !== 'true') return; // 스위치
  const forced = process.env.FORCE_PERIOD || null; // 테스트용 강제 월
  try {
    console.log('[cron] tick: publish job running...', forced ?? '(auto prev month)');
    const result = await publishMonthlySettlements(forced);

    if (result.status === 'skipped') {
      console.log(`[cron] job skipped: ${result.periodYm} (duplicate execution)`);
    } else if (result.status === 'completed') {
      console.log(
        `[cron] job completed: ${result.periodYm}, processed: ${result.upserted} records`
      );
    }
  } catch (e) {
    console.error('[cron] job failed:', e?.message || e);
  }
});
