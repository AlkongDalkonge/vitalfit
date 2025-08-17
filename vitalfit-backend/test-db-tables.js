const { sequelize } = require('./src/models');

async function testDatabase() {
  try {
    console.log('🔍 데이터베이스 연결 테스트...');
    
    // 연결 테스트
    await sequelize.authenticate();
    console.log('✅ 데이터베이스 연결 성공!');
    
    // 테이블 목록 조회
    const tables = await sequelize.showAllSchemas();
    console.log('\n📋 사용 가능한 스키마:', tables.map(t => t.name));
    
    // public 스키마의 테이블 조회
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const [results] = await sequelize.query(query);
    console.log('\n📊 public 스키마 테이블 목록:');
    results.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // 각 테이블의 레코드 수 확인
    console.log('\n📈 테이블별 레코드 수:');
    for (const row of results) {
      const tableName = row.table_name;
      try {
        const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
        const count = countResult[0].count;
        console.log(`  - ${tableName}: ${count}개`);
      } catch (error) {
        console.log(`  - ${tableName}: 조회 실패 (${error.message})`);
      }
    }
    
    // users 테이블 구조 확인
    console.log('\n👥 users 테이블 구조:');
    try {
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);
      
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL 허용' : 'NOT NULL'})`);
      });
    } catch (error) {
      console.log(`  ❌ users 테이블 구조 조회 실패: ${error.message}`);
    }
    
    // positions 테이블 데이터 확인
    console.log('\n💼 positions 테이블 데이터:');
    try {
      const [positions] = await sequelize.query('SELECT * FROM positions ORDER BY id;');
      if (positions.length > 0) {
        positions.forEach(pos => {
          console.log(`  - ID: ${pos.id}, 코드: ${pos.code}, 이름: ${pos.name}, 레벨: ${pos.level}, 기본급: ${pos.base_salary}`);
        });
      } else {
        console.log('  📭 positions 테이블에 데이터가 없습니다.');
      }
    } catch (error) {
      console.log(`  ❌ positions 테이블 조회 실패: ${error.message}`);
    }
    
    // users 테이블 데이터 확인
    console.log('\n👤 users 테이블 데이터:');
    try {
      const [users] = await sequelize.query('SELECT id, name, email, position_id, center_id, status FROM users ORDER BY id;');
      if (users.length > 0) {
        users.forEach(user => {
          console.log(`  - ID: ${user.id}, 이름: ${user.name}, 이메일: ${user.email}, 직급ID: ${user.position_id}, 센터ID: ${user.center_id}, 상태: ${user.status}`);
        });
      } else {
        console.log('  📭 users 테이블에 데이터가 없습니다.');
      }
    } catch (error) {
      console.log(`  ❌ users 테이블 조회 실패: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ 데이터베이스 테스트 실패:', error.message);
    console.error('스택 트레이스:', error.stack);
  } finally {
    await sequelize.close();
    console.log('\n🔒 데이터베이스 연결 종료');
  }
}

testDatabase();

