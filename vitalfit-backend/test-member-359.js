const { User, Member, Position, Team, Center } = require('./src/models');

// 멤버 359번(박유나) 정보 확인 함수
async function checkMember359() {
  try {
    console.log('🔍 멤버 359번(박유나) 정보 확인\n');

    // 멤버 359번 정보 확인
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 멤버 359번(박유나) 정보`);
    console.log(`${'='.repeat(60)}`);

    const member = await Member.findByPk(359, {
      include: [
        {
          model: User,
          as: 'trainer',
          attributes: ['id', 'name', 'email', 'position_id'],
          include: [
            { model: Position, as: 'position', attributes: ['id', 'name', 'level'] }
          ]
        },
        {
          model: Center,
          as: 'center',
          attributes: ['id', 'name']
        }
      ]
    });

    if (member) {
      console.log(`   멤버 ID: ${member.id}`);
      console.log(`   멤버 이름: ${member.name}`);
      console.log(`   멤버 전화번호: ${member.phone}`);
      console.log(`   멤버 센터: ${member.center?.name || 'N/A'}`);
      console.log(`   담당 트레이너 ID: ${member.trainer_id}`);
      console.log(`   담당 트레이너 이름: ${member.trainer?.name || 'N/A'}`);
      console.log(`   담당 트레이너 이메일: ${member.trainer?.email || 'N/A'}`);
      console.log(`   담당 트레이너 포지션: ${member.trainer?.position?.name || 'N/A'} (레벨: ${member.trainer?.position?.level || 'N/A'})`);
    } else {
      console.log('❌ 멤버 359번을 찾을 수 없습니다.');
    }

    // 김민수 팀장 정보도 확인
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 김민수 팀장 정보`);
    console.log(`${'='.repeat(60)}`);

    const kimMinsu = await User.findByPk(2, {
      include: [
        { model: Position, as: 'position', attributes: ['id', 'name', 'level'] }
      ]
    });

    if (kimMinsu) {
      console.log(`   트레이너 ID: ${kimMinsu.id}`);
      console.log(`   트레이너 이름: ${kimMinsu.name}`);
      console.log(`   트레이너 이메일: ${kimMinsu.email}`);
      console.log(`   트레이너 포지션: ${kimMinsu.position?.name || 'N/A'} (레벨: ${kimMinsu.position?.level || 'N/A'})`);
    }

    // 권한 체크 시뮬레이션
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 권한 체크 시뮬레이션`);
    console.log(`${'='.repeat(60)}`);

    if (member && kimMinsu) {
      const memberTrainerId = member.trainer_id;
      const kimMinsuId = kimMinsu.id;
      const isMatch = Number(memberTrainerId) === Number(kimMinsuId);
      
      console.log(`   멤버 담당 트레이너 ID: ${memberTrainerId} (타입: ${typeof memberTrainerId})`);
      console.log(`   김민수 팀장 ID: ${kimMinsuId} (타입: ${typeof kimMinsuId})`);
      console.log(`   ID 일치 여부: ${isMatch}`);
      console.log(`   권한 있음: ${isMatch ? '✅ 예' : '❌ 아니오'}`);
    }

    console.log('\n🎯 멤버 359번 정보 확인 완료!');

  } catch (error) {
    console.error('\n❌ 오류:', error.message);
  }
}

// 테스트 실행
checkMember359().catch(console.error);
