const { User, Member, Position, Team, Center } = require('./src/models');

// 멤버 정보 확인 함수
async function checkMemberInfo() {
  try {
    console.log('🔍 멤버 정보 확인\n');

    // 이영희 트레이너 정보 확인
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 이영희 트레이너 정보`);
    console.log(`${'='.repeat(60)}`);

    const leeTrainer = await User.findByPk(3, {
      include: [
        { model: Position, as: 'position', attributes: ['id', 'name', 'level'] },
        { model: Team, as: 'team', attributes: ['id', 'name'] },
        { model: Center, as: 'center', attributes: ['id', 'name'] }
      ]
    });

    if (leeTrainer) {
      console.log(`   트레이너 ID: ${leeTrainer.id}`);
      console.log(`   트레이너 이름: ${leeTrainer.name}`);
      console.log(`   트레이너 이메일: ${leeTrainer.email}`);
      console.log(`   트레이너 포지션: ${leeTrainer.position?.name || 'N/A'} (레벨: ${leeTrainer.position?.level || 'N/A'})`);
      console.log(`   트레이너 팀: ${leeTrainer.team?.name || 'N/A'}`);
      console.log(`   트레이너 센터: ${leeTrainer.center?.name || 'N/A'}`);
    }

    // 이영희 트레이너가 담당하는 멤버들 확인
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 이영희 트레이너가 담당하는 멤버들`);
    console.log(`${'='.repeat(60)}`);

    const leeMembers = await Member.findAll({
      where: { trainer_id: 3 },
      include: [
        {
          model: Center,
          as: 'center',
          attributes: ['id', 'name']
        }
      ],
      limit: 5
    });

    console.log(`   총 ${leeMembers.length}명의 멤버를 담당하고 있습니다.`);
    leeMembers.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.name} (ID: ${member.id}, 센터: ${member.center?.name || 'N/A'})`);
    });

    // 이영희 트레이너가 담당하지 않는 멤버들 확인
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 이영희 트레이너가 담당하지 않는 멤버들`);
    console.log(`${'='.repeat(60)}`);

    const otherMembers = await Member.findAll({
      where: { 
        trainer_id: { [require('sequelize').Op.ne]: 3 } 
      },
      include: [
        {
          model: User,
          as: 'trainer',
          attributes: ['id', 'name', 'email'],
          include: [
            { model: Position, as: 'position', attributes: ['id', 'name', 'level'] },
            { model: Team, as: 'team', attributes: ['id', 'name'] },
            { model: Center, as: 'center', attributes: ['id', 'name'] }
          ]
        },
        {
          model: Center,
          as: 'center',
          attributes: ['id', 'name']
        }
      ],
      limit: 5
    });

    console.log(`   총 ${otherMembers.length}명의 멤버가 다른 트레이너가 담당하고 있습니다.`);
    otherMembers.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.name} (ID: ${member.id})`);
      console.log(`      담당 트레이너: ${member.trainer?.name || '없음'} (ID: ${member.trainer?.id || 'N/A'})`);
      console.log(`      트레이너 팀: ${member.trainer?.team?.name || 'N/A'}`);
      console.log(`      멤버 센터: ${member.center?.name || 'N/A'}`);
    });

    console.log('\n🎯 멤버 정보 확인 완료!');

  } catch (error) {
    console.error('\n❌ 오류:', error.message);
  }
}

// 테스트 실행
checkMemberInfo().catch(console.error);
