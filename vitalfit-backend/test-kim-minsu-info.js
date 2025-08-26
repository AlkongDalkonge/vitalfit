const { User, Member, Position, Team, Center } = require('./src/models');

// 김민수 팀장 정보 확인 함수
async function checkKimMinsuInfo() {
  try {
    console.log('🔍 김민수 팀장 정보 확인\n');

    // 김민수 팀장 정보 확인
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 김민수 팀장 정보`);
    console.log(`${'='.repeat(60)}`);

    const kimMinsu = await User.findByPk(2, {
      include: [
        { model: Position, as: 'position', attributes: ['id', 'name', 'level'] },
        { model: Team, as: 'team', attributes: ['id', 'name'] },
        { model: Center, as: 'center', attributes: ['id', 'name'] }
      ]
    });

    if (kimMinsu) {
      console.log(`   트레이너 ID: ${kimMinsu.id}`);
      console.log(`   트레이너 이름: ${kimMinsu.name}`);
      console.log(`   트레이너 이메일: ${kimMinsu.email}`);
      console.log(`   트레이너 포지션: ${kimMinsu.position?.name || 'N/A'} (레벨: ${kimMinsu.position?.level || 'N/A'})`);
      console.log(`   트레이너 팀: ${kimMinsu.team?.name || 'N/A'}`);
      console.log(`   트레이너 센터: ${kimMinsu.center?.name || 'N/A'}`);
    }

    // 김민수 팀장이 담당하는 멤버들 확인
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 김민수 팀장이 담당하는 멤버들`);
    console.log(`${'='.repeat(60)}`);

    const kimMembers = await Member.findAll({
      where: { trainer_id: 2 },
      include: [
        {
          model: Center,
          as: 'center',
          attributes: ['id', 'name']
        }
      ],
      limit: 10
    });

    console.log(`   총 ${kimMembers.length}명의 멤버를 담당하고 있습니다.`);
    kimMembers.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.name} (ID: ${member.id}, 센터: ${member.center?.name || 'N/A'})`);
    });

    console.log('\n🎯 김민수 팀장 정보 확인 완료!');

  } catch (error) {
    console.error('\n❌ 오류:', error.message);
  }
}

// 테스트 실행
checkKimMinsuInfo().catch(console.error);
