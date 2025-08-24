const { User, Position } = require('./src/models');

async function testUsers() {
  try {
    await require('./src/models').sequelize.sync();
    
    const users = await User.findAll({
      include: [
        { 
          model: Position, 
          as: 'position', 
          attributes: ['id', 'name', 'level'] 
        }
      ],
      attributes: ['id', 'name', 'email', 'position_id'],
      limit: 15
    });

    console.log('테스트용 계정들:');
    console.log('================');
    
    users.forEach(u => {
      console.log(`ID: ${u.id}, 이름: ${u.name}, 이메일: ${u.email}, 포지션: ${u.position?.name} (레벨: ${u.position?.level})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('오류:', error);
    process.exit(1);
  }
}

testUsers();
