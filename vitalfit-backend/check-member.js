const { sequelize } = require('./src/models');
const { Member, Payment, PTSession, Center, User } = require('./src/models');

async function checkMemberData() {
  try {
    await sequelize.authenticate();
    console.log('데이터베이스 연결 성공');

    // 전은호 회원 찾기
    const member = await Member.findOne({
      where: { name: '전은호' },
      include: [
        { model: Center, as: 'center' },
        { model: User, as: 'trainer' }
      ]
    });

    if (!member) {
      console.log('전은호 회원을 찾을 수 없습니다.');
      return;
    }

    console.log('\n=== 전은호 회원 정보 ===');
    console.log('ID:', member.id);
    console.log('이름:', member.name);
    console.log('센터:', member.center?.name);
    console.log('트레이너:', member.trainer?.name);
    console.log('total_sessions:', member.total_sessions);
    console.log('used_sessions:', member.used_sessions);
    console.log('free_sessions:', member.free_sessions);

    // 결제 내역 조회
    const payments = await Payment.findAll({
      where: { member_id: member.id },
      order: [['payment_date', 'DESC']]
    });

    console.log('\n=== 결제 내역 ===');
    payments.forEach(payment => {
      console.log(`${payment.payment_date}: ${payment.session_count}개 PT, ${payment.free_session_count}개 보너스`);
    });

    // PT 세션 조회
    const ptSessions = await PTSession.findAll({
      where: { member_id: member.id },
      order: [['session_date', 'DESC']]
    });

    console.log('\n=== PT 세션 내역 ===');
    const regularSessions = ptSessions.filter(s => s.session_type === 'regular');
    const freeSessions = ptSessions.filter(s => s.session_type === 'free');
    
    console.log(`총 세션: ${ptSessions.length}개`);
    console.log(`일반 세션: ${regularSessions.length}개`);
    console.log(`보너스 세션: ${freeSessions.length}개`);

    // payments 테이블의 session_count 합계
    const totalSessionCount = payments.reduce((sum, p) => sum + (p.session_count || 0), 0);
    const totalFreeSessionCount = payments.reduce((sum, p) => sum + (p.free_session_count || 0), 0);

    console.log('\n=== 계산 결과 ===');
    console.log(`payments 테이블 총 session_count: ${totalSessionCount}`);
    console.log(`payments 테이블 총 free_session_count: ${totalFreeSessionCount}`);
    console.log(`실제 사용한 일반 세션: ${regularSessions.length}`);
    console.log(`실제 사용한 보너스 세션: ${freeSessions.length}`);
    console.log(`잔여 일반 세션: ${Math.max(0, totalSessionCount - regularSessions.length)}`);
    console.log(`잔여 보너스 세션: ${Math.max(0, totalFreeSessionCount - freeSessions.length)}`);

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await sequelize.close();
  }
}

checkMemberData(); 