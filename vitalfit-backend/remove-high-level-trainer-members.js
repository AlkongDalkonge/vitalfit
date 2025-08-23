const { Member, User, Position } = require('./src/models');

async function removeHighLevelTrainerMembers() {
  try {
    console.log('🔍 포지션 레벨 8 이상의 사용자가 담당인 멤버 조회 중...');
    
    // 포지션 레벨 8 이상의 사용자들 조회
    const highLevelUsers = await User.findAll({
      include: [
        { model: Position, as: 'position', attributes: ['level'] }
      ],
      where: {
        '$position.level$': {
          [require('sequelize').Op.gte]: 8
        }
      }
    });

    console.log(`📊 포지션 레벨 8 이상 사용자: ${highLevelUsers.length}명`);
    highLevelUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.position?.name}, 레벨: ${user.position?.level})`);
    });

    if (highLevelUsers.length === 0) {
      console.log('✅ 삭제할 멤버가 없습니다.');
      return;
    }

    const highLevelUserIds = highLevelUsers.map(user => user.id);
    
    // 해당 사용자들이 담당인 멤버들 조회
    const membersToDelete = await Member.findAll({
      where: {
        trainer_id: {
          [require('sequelize').Op.in]: highLevelUserIds
        }
      },
      include: [
        { model: User, as: 'trainer', attributes: ['name'] }
      ]
    });

    console.log(`🗑️ 삭제할 멤버: ${membersToDelete.length}명`);
    membersToDelete.forEach(member => {
      console.log(`  - ${member.name} (담당: ${member.trainer?.name})`);
    });

    if (membersToDelete.length === 0) {
      console.log('✅ 삭제할 멤버가 없습니다.');
      return;
    }

    // 멤버 삭제
    const deleteResult = await Member.destroy({
      where: {
        trainer_id: {
          [require('sequelize').Op.in]: highLevelUserIds
        }
      }
    });

    console.log(`✅ ${deleteResult}명의 멤버가 삭제되었습니다.`);
    
    // 삭제 후 확인
    const remainingMembers = await Member.findAll({
      where: {
        trainer_id: {
          [require('sequelize').Op.in]: highLevelUserIds
        }
      }
    });

    if (remainingMembers.length === 0) {
      console.log('✅ 모든 대상 멤버가 성공적으로 삭제되었습니다.');
    } else {
      console.log(`⚠️ ${remainingMembers.length}명의 멤버가 여전히 남아있습니다.`);
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    process.exit(0);
  }
}

// 스크립트 실행
removeHighLevelTrainerMembers(); 