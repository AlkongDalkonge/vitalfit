const jwt = require('jsonwebtoken');
const { User, PTSession, Member, Position, Center, Team } = require('./src/models');

// 김민수 팀장 정보
const kimMinsu = {
  id: 2,
  name: '김민수',
  email: 'kim.gangnam1@vitalfit.co.kr',
  position: '팀장',
  level: 7,
  team_id: 1,
  center_id: 1
};

// JWT 토큰 생성 함수
function generateToken(userId) {
  return jwt.sign(
    { 
      uid: userId,
      id: userId,
      email: kimMinsu.email
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );
}

// 김민수 팀장의 권한 테스트
async function testKimMinsuPermissions() {
  try {
    console.log('🔍 김민수 팀장 권한 테스트 시작\n');
    
    // 1. 김민수 팀장 정보 조회
    const user = await User.findByPk(kimMinsu.id, {
      include: [
        { model: Position, as: 'position', attributes: ['id', 'name', 'level'] },
        { model: Team, as: 'team', attributes: ['id', 'name'] },
        { model: Center, as: 'center', attributes: ['id', 'name'] },
      ],
    });

    console.log(`📋 김민수 팀장 정보:`);
    console.log(`   이름: ${user.name}`);
    console.log(`   포지션: ${user.position.name} (레벨: ${user.position.level})`);
    console.log(`   팀: ${user.team?.name} (ID: ${user.team_id})`);
    console.log(`   센터: ${user.center?.name} (ID: ${user.center_id})`);

    // 2. 강남1팀에 속한 트레이너들 조회
    const teamTrainers = await User.findAll({
      where: { team_id: user.team_id },
      attributes: ['id', 'name', 'position_id'],
      include: [{ model: Position, as: 'position', attributes: ['name', 'level'] }],
    });

    console.log(`\n👥 강남1팀 소속 트레이너들 (${teamTrainers.length}명):`);
    teamTrainers.forEach(trainer => {
      console.log(`   - ${trainer.name} (ID: ${trainer.id}, ${trainer.position.name})`);
    });

    // 3. 강남1팀 트레이너들이 담당하는 멤버들 조회
    const trainerIds = teamTrainers.map(trainer => trainer.id);
    const teamMembers = await Member.findAll({
      where: { trainer_id: { [require('sequelize').Op.in]: trainerIds } },
      attributes: ['id', 'name', 'trainer_id'],
      include: [{ model: User, as: 'trainer', attributes: ['id', 'name'] }],
    });

    console.log(`\n👥 강남1팀 트레이너들이 담당하는 멤버들 (${teamMembers.length}명):`);
    teamMembers.forEach(member => {
      console.log(`   - ${member.name} (담당: ${member.trainer.name})`);
    });

    // 4. 강남1팀 멤버들의 PT 세션 조회
    const memberIds = teamMembers.map(member => member.id);
    const { count, rows: ptSessions } = await PTSession.findAndCountAll({
      where: { member_id: { [require('sequelize').Op.in]: memberIds } },
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'trainer',
          attributes: ['id', 'name'],
        },
      ],
      order: [['session_date', 'DESC']],
      limit: 10,
    });

    console.log(`\n📊 강남1팀 멤버들의 PT 세션 (총 ${count}개, 최근 10개 표시):`);
    ptSessions.forEach((session, index) => {
      console.log(`   ${index + 1}. ${session.member.name} (트레이너: ${session.trainer.name}, 날짜: ${session.session_date})`);
    });

    // 5. 권한 필터링 테스트
    console.log(`\n🔒 권한 필터링 테스트:`);
    
    // 포지션 7~10: 소속 팀 멤버의 PT 세션 조회/관리
    const whereClause = {};
    whereClause.trainer_id = { [require('sequelize').Op.in]: trainerIds };
    
    console.log(`   필터링 조건: trainer_id IN [${trainerIds.join(', ')}]`);
    
    const filteredSessions = await PTSession.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'trainer',
          attributes: ['id', 'name'],
        },
      ],
      order: [['session_date', 'DESC']],
      limit: 5,
    });

    console.log(`   필터링 결과: ${filteredSessions.count}개 중 5개 표시`);
    filteredSessions.rows.forEach((session, index) => {
      console.log(`     ${index + 1}. ${session.member.name} (트레이너: ${session.trainer.name})`);
    });

    console.log('\n✅ 김민수 팀장 권한 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  }
}

// 테스트 실행
testKimMinsuPermissions().catch(console.error);
