const http = require('http');
const fs = require('fs');

// 저장된 토큰 읽기
function getStoredToken() {
  try {
    return fs.readFileSync('kim-minsu-token.txt', 'utf8').trim();
  } catch (error) {
    console.error('❌ 토큰 파일을 읽을 수 없습니다:', error.message);
    return null;
  }
}

// PT 세션 생성 API 호출 함수
async function createPTSession(memberId, token) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      member_id: memberId,
      trainer_id: 2, // 김민수 팀장 ID
      center_id: 1, // 강남센터 ID
      session_date: '2024-08-25',
      start_time: '10:00',
      end_time: '11:00',
      session_type: 'regular',
      signature_data: 'test-signature',
      notes: '테스트 PT 세션'
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/pt-sessions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

// 테스트 실행
async function testPTCreate() {
  try {
    console.log('🔍 김민수 팀장으로 PT 세션 생성 테스트\n');

    // 1. 저장된 토큰 읽기
    const token = getStoredToken();
    if (!token) {
      console.log('❌ 토큰이 없습니다. 먼저 로그인을 실행해주세요.');
      return;
    }

    console.log(`🔑 토큰 읽기 완료: ${token.substring(0, 50)}...`);

    // 테스트할 멤버들 (김민수 팀장이 담당하는 멤버들)
    const testMembers = [
      { id: 1, name: '이태민' },
      { id: 2, name: '강동훈' },
      { id: 3, name: '장서연' },
      { id: 4, name: '최영희' },
      { id: 5, name: '박성민' }
    ];

    for (const member of testMembers) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📋 ${member.name} (ID: ${member.id}) PT 세션 생성 테스트`);
      console.log(`${'='.repeat(60)}`);

      console.log(`\n📡 PT 세션 생성 요청:`);
      console.log(`   URL: http://localhost:3001/api/pt-sessions`);
      console.log(`   Method: POST`);
      console.log(`   Member ID: ${member.id}`);

      const response = await createPTSession(member.id, token);

      console.log(`\n📊 생성 API 응답:`);
      console.log(`   Status Code: ${response.statusCode}`);
      console.log(`   Success: ${response.data.success}`);
      console.log(`   Message: ${response.data.message}`);

      if (response.statusCode === 201 && response.data.success) {
        console.log(`\n✅ PT 세션 생성 성공!`);
        console.log(`   생성된 세션 ID: ${response.data.data?.id || 'N/A'}`);
      } else if (response.statusCode === 403) {
        console.log(`\n❌ 권한 없음: ${response.data.message}`);
      } else if (response.statusCode === 400) {
        console.log(`\n⚠️ 입력값 오류: ${response.data.message}`);
        console.log(`   상세 오류:`, response.data);
      } else {
        console.log(`\n❌ 예상치 못한 오류: ${response.data.message}`);
      }
    }

    console.log('\n🎯 PT 세션 생성 테스트 완료!');

  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
  }
}

// 테스트 실행
testPTCreate().catch(console.error);
