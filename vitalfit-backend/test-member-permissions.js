const jwt = require('jsonwebtoken');
const axios = require('axios');

// 테스트용 계정 정보
const testAccounts = [
  { id: 1, name: '관리자', email: 'admin@vitalfit.co.kr', position: '관리자', level: 99 },
  { id: 2, name: '김민수', email: 'kim.gangnam1@vitalfit.co.kr', position: '팀장', level: 7 },
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

// API 테스트 함수
async function testMemberAPI(token, testName) {
  try {
    const response = await axios.get('http://localhost:3001/api/members', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ ${testName} - 성공`);
    console.log(`   조회된 멤버 수: ${response.data.data.members.length}명`);
    console.log(`   총 멤버 수: ${response.data.data.pagination.total}명`);
    
    // 첫 번째 멤버 정보 출력 (있다면)
    if (response.data.data.members.length > 0) {
      const firstMember = response.data.data.members[0];
      console.log(`   첫 번째 멤버: ${firstMember.name} (센터: ${firstMember.center?.name}, 트레이너: ${firstMember.trainer?.name})`);
    }
    
    return response.data;
  } catch (error) {
    console.log(`❌ ${testName} - 실패`);
    console.log(`   오류: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// 멤버 생성 테스트
async function testMemberCreation(token, testName) {
  try {
    const memberData = {
      name: '테스트 멤버',
      phone: '010-1234-5678',
      center_id: 1,
      trainer_id: 3,
      join_date: '2024-01-01',
      total_sessions: 10,
      used_sessions: 0,
      free_sessions: 0,
      status: 'active'
    };

    const response = await axios.post('http://localhost:3001/api/members', memberData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ ${testName} - 성공`);
    console.log(`   생성된 멤버: ${response.data.data.name}`);
    return response.data.data.id;
  } catch (error) {
    console.log(`❌ ${testName} - 실패`);
    console.log(`   오류: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// 멤버 수정 테스트
async function testMemberUpdate(token, memberId, testName) {
  try {
    const updateData = {
      name: '수정된 테스트 멤버',
      memo: '권한 테스트로 수정됨'
    };

    const response = await axios.put(`http://localhost:3001/api/members/${memberId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ ${testName} - 성공`);
    console.log(`   수정된 멤버: ${response.data.data.name}`);
    return true;
  } catch (error) {
    console.log(`❌ ${testName} - 실패`);
    console.log(`   오류: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 메인 테스트 함수
async function runTests() {
  console.log('🔐 멤버 권한 테스트 시작\n');
  
  for (const account of testAccounts) {
    console.log(`\n📋 ${account.name} (${account.position}, 레벨: ${account.level}) 테스트`);
    console.log('=' .repeat(50));
    
    const token = generateToken(account.id);
    
    // 1. 멤버 조회 테스트
    const membersData = await testMemberAPI(token, '멤버 조회');
    
    // 2. 멤버 생성 테스트
    const createdMemberId = await testMemberCreation(token, '멤버 생성');
    
    // 3. 멤버 수정 테스트 (생성된 멤버가 있다면)
    if (createdMemberId) {
      await testMemberUpdate(token, createdMemberId, '멤버 수정');
    }
    
    console.log('');
  }
  
  console.log('\n🎉 모든 테스트 완료!');
}

// 테스트 실행
runTests().catch(console.error);
