const cron = require('node-cron');
const { publishMonthlySettlements } = require('../services/settlementPublisher');

/**
 * 개발 테스트용으로 1분마다 실행.
 * 운영에선 "0 9 1 * *" (매월 1일 09:00)로 바꿀 예정.
 */
cron.schedule('*/1 * * * *', async () => {
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
