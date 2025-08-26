const jwt = require('jsonwebtoken');
const { User, Member, Position, Center, Team } = require('./src/models');

// 테스트용 계정 정보
const testAccounts = [
  { id: 3, name: '이영희', email: 'lee.gangnam1@vitalfit.co.kr', position: '트레이너', level: 3 },
  { id: 15, name: '홍유진', email: 'hong.hongdae1@vitalfit.co.kr', position: '팀장', level: 7 }
];

// JWT 토큰 생성 함수
function generateToken(userId) {
  return jwt.sign(
    { 
      uid: userId,
      id: userId,
      email: testAccounts.find(u => u.id === userId)?.email || 'test@test.com'
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );
}

// 멤버 조회 테스트 (실제 DB 쿼리)
async function testMemberQuery(userId, testName) {
  try {
    // 사용자 정보 조회
    const user = await User.findByPk(userId, {
      include: [
        { model: Position, as: 'position', attributes: ['id', 'name', 'level'] },
        { model: Team, as: 'team', attributes: ['id', 'name'] },
        { model: Center, as: 'center', attributes: ['id', 'name'] },
      ],
    });

    if (!user || !user.position) {
      console.log(`❌ ${testName} - 사용자 정보 없음`);
      return;
    }

    console.log(`\n📋 ${testName} (${user.name}, ${user.position.name}, 레벨: ${user.position.level})`);
    console.log(`   센터: ${user.center?.name || '없음'}, 팀: ${user.team?.name || '없음'}`);

    let whereClause = {};
    const currentUserLevel = user.position.level;

    // 권한에 따른 필터링 적용
    if (currentUserLevel >= 1 && currentUserLevel <= 6) {
      // 포지션 1~6: 본인 담당 멤버만 조회/관리
      whereClause.trainer_id = userId;
      console.log(`   🔒 권한: 본인 담당 멤버만 조회 (trainer_id = ${userId})`);
    } else if (currentUserLevel >= 7 && currentUserLevel <= 10) {
      // 포지션 7~10: 소속 팀 멤버 조회/관리
      if (!user.team_id) {
        console.log(`   ❌ 권한: 팀 정보가 없어 권한 확인 불가`);
        return;
      }
      
      // 팀에 속한 트레이너들의 ID를 조회
      const teamTrainers = await User.findAll({
        where: { team_id: user.team_id },
        attributes: ['id'],
      });
      
      const trainerIds = teamTrainers.map(trainer => trainer.id);
      whereClause.trainer_id = { [require('sequelize').Op.in]: trainerIds };
      console.log(`   🔒 권한: 소속 팀 멤버 조회 (팀 ID: ${user.team_id}, 트레이너 수: ${trainerIds.length}명)`);
    } else if (currentUserLevel === 11) {
      // 포지션 11: 소속 센터 멤버 조회/관리
      if (!user.center_id) {
        console.log(`   ❌ 권한: 센터 정보가 없어 권한 확인 불가`);
        return;
      }
      whereClause.center_id = user.center_id;
      console.log(`   🔒 권한: 소속 센터 멤버 조회 (센터 ID: ${user.center_id})`);
    } else if (currentUserLevel === 12 || currentUserLevel === 99) {
      // 포지션 12, 99: 모든 멤버 조회/관리 가능
      console.log(`   🔒 권한: 모든 멤버 조회 (필터링 없음)`);
    }

    // 멤버 조회
    const { count, rows: members } = await Member.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Center,
          as: 'center',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'trainer',
          attributes: ['id', 'name'],
        },
      ],
      limit: 5, // 처음 5개만 조회
    });

    console.log(`   ✅ 조회 결과: ${count}명 중 ${members.length}명 표시`);
    
    if (members.length > 0) {
      console.log(`   📋 조회된 멤버들:`);
      members.forEach((member, index) => {
        console.log(`      ${index + 1}. ${member.name} (센터: ${member.center?.name}, 트레이너: ${member.trainer?.name})`);
      });
    }

    return { count, members };
  } catch (error) {
    console.log(`❌ ${testName} - 오류: ${error.message}`);
    return null;
  }
}

// 메인 테스트 함수
async function runSimpleTests() {
  console.log('🔐 멤버 권한 간단 테스트 시작\n');
  
  for (const account of testAccounts) {
    await testMemberQuery(account.id, `${account.name} (${account.position})`);
  }
  
  console.log('\n🎉 테스트 완료!');
}

// 테스트 실행
runSimpleTests().catch(console.error);
