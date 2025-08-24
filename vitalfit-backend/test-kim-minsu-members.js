const { User, PTSession, Member, Position, Center, Team } = require('./src/models');

// 김민수 팀장이 담당하는 멤버들 중 PT 세션이 있는 멤버 찾기
async function testKimMinsuMembersWithSessions() {
  try {
    console.log('🔍 김민수 팀장 담당 멤버들 중 PT 세션이 있는 멤버 찾기\n');
    
    // 1. 김민수 팀장이 담당하는 멤버들 조회
    const kimMinsuMembers = await Member.findAll({
      where: { trainer_id: 2 }, // 김민수 팀장 ID: 2
      attributes: ['id', 'name', 'trainer_id'],
      include: [{ model: User, as: 'trainer', attributes: ['id', 'name'] }],
    });

    console.log(`📋 김민수 팀장이 담당하는 멤버들 (${kimMinsuMembers.length}명):`);
    kimMinsuMembers.forEach(member => {
      console.log(`   - ${member.name} (ID: ${member.id})`);
    });

    // 2. 각 멤버별 PT 세션 수 조회
    console.log(`\n📊 각 멤버별 PT 세션 수:`);
    const membersWithSessions = [];
    
    for (const member of kimMinsuMembers) {
      const { count } = await PTSession.findAndCountAll({
        where: { member_id: member.id },
      });
      
      console.log(`   - ${member.name} (ID: ${member.id}): ${count}개`);
      
      if (count > 0) {
        membersWithSessions.push({
          id: member.id,
          name: member.name,
          sessionCount: count
        });
      }
    }

    // 3. PT 세션이 있는 멤버들 중 첫 번째 멤버의 상세 정보
    if (membersWithSessions.length > 0) {
      const firstMember = membersWithSessions[0];
      console.log(`\n🎯 테스트용 멤버: ${firstMember.name} (ID: ${firstMember.id}, PT 세션: ${firstMember.sessionCount}개)`);
      
      // 해당 멤버의 최근 PT 세션 5개 조회
      const { rows: recentSessions } = await PTSession.findAndCountAll({
        where: { member_id: firstMember.id },
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

      console.log(`\n📋 ${firstMember.name}의 최근 PT 세션들:`);
      recentSessions.forEach((session, index) => {
        console.log(`   ${index + 1}. ${session.session_date} (트레이너: ${session.trainer.name})`);
      });

      console.log(`\n🔗 테스트 URL: /member/${firstMember.id}/pt-sessions`);
    } else {
      console.log(`\n❌ 김민수 팀장이 담당하는 멤버들 중 PT 세션이 있는 멤버가 없습니다.`);
    }

    // 4. 강남1팀 전체 멤버들의 PT 세션 통계
    console.log(`\n📈 강남1팀 전체 통계:`);
    
    // 강남1팀 트레이너들이 담당하는 모든 멤버들의 PT 세션 수
    const teamTrainers = await User.findAll({
      where: { team_id: 1 }, // 강남1팀 ID: 1
      attributes: ['id'],
    });
    
    const trainerIds = teamTrainers.map(trainer => trainer.id);
    const teamMembers = await Member.findAll({
      where: { trainer_id: { [require('sequelize').Op.in]: trainerIds } },
      attributes: ['id', 'name', 'trainer_id'],
      include: [{ model: User, as: 'trainer', attributes: ['id', 'name'] }],
    });

    let totalSessions = 0;
    let membersWithAnySessions = 0;
    
    for (const member of teamMembers) {
      const { count } = await PTSession.findAndCountAll({
        where: { member_id: member.id },
      });
      
      if (count > 0) {
        membersWithAnySessions++;
        totalSessions += count;
      }
    }

    console.log(`   강남1팀 총 멤버 수: ${teamMembers.length}명`);
    console.log(`   PT 세션이 있는 멤버 수: ${membersWithAnySessions}명`);
    console.log(`   총 PT 세션 수: ${totalSessions}개`);

    console.log('\n✅ 김민수 팀장 담당 멤버 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  }
}

// 테스트 실행
testKimMinsuMembersWithSessions().catch(console.error);
