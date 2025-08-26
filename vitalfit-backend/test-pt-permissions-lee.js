const http = require('http');
const fs = require('fs');

// 저장된 토큰 읽기
function getStoredToken() {
  try {
    return fs.readFileSync('이영희-트레이너-(강남1팀)-token.txt', 'utf8').trim();
  } catch (error) {
    console.error('❌ 토큰 파일을 읽을 수 없습니다:', error.message);
    return null;
  }
}

// PT 세션 조회 API 호출 함수
async function getPTSessions(memberId, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/pt-sessions/member/${memberId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
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

    req.end();
  });
}

// PT 세션 생성 API 호출 함수
async function createPTSession(memberId, token) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      member_id: memberId,
      session_date: '2024-08-25',
      start_time: '10:00',
      end_time: '11:00',
      session_type: 'PT',
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
async function testPTPermissions() {
  try {
    console.log('🔍 이영희 트레이너로 PT 세션 권한 테스트\n');

    // 1. 저장된 토큰 읽기
    const token = getStoredToken();
    if (!token) {
      console.log('❌ 토큰이 없습니다. 먼저 로그인을 실행해주세요.');
      return;
    }

    console.log(`🔑 토큰 읽기 완료: ${token.substring(0, 50)}...`);

    // 테스트할 멤버들
    const testMembers = [
      { id: 12, name: '강철수 (담당 멤버)' },
      { id: 13, name: '권상우 (담당 멤버)' },
      { id: 1, name: '이태민 (담당하지 않는 멤버)' },
      { id: 2, name: '강동훈 (담당하지 않는 멤버)' }
    ];

    for (const member of testMembers) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📋 ${member.name} (ID: ${member.id}) 테스트`);
      console.log(`${'='.repeat(60)}`);

      // 2. PT 세션 조회 테스트
      console.log(`\n📡 PT 세션 조회 테스트:`);
      console.log(`   URL: http://localhost:3001/api/pt-sessions/member/${member.id}`);
      console.log(`   Method: GET`);

      const getResponse = await getPTSessions(member.id, token);

      console.log(`\n📊 조회 API 응답:`);
      console.log(`   Status Code: ${getResponse.statusCode}`);
      console.log(`   Success: ${getResponse.data.success}`);
      console.log(`   Message: ${getResponse.data.message}`);

      if (getResponse.statusCode === 200 && getResponse.data.success) {
        console.log(`\n✅ 조회 권한 확인됨!`);
      } else if (getResponse.statusCode === 403) {
        console.log(`\n❌ 조회 권한 없음: ${getResponse.data.message}`);
      }

      // 3. PT 세션 생성 테스트
      console.log(`\n📡 PT 세션 생성 테스트:`);
      console.log(`   URL: http://localhost:3001/api/pt-sessions`);
      console.log(`   Method: POST`);

      const createResponse = await createPTSession(member.id, token);

      console.log(`\n📊 생성 API 응답:`);
      console.log(`   Status Code: ${createResponse.statusCode}`);
      console.log(`   Success: ${createResponse.data.success}`);
      console.log(`   Message: ${createResponse.data.message}`);

      if (createResponse.statusCode === 201 && createResponse.data.success) {
        console.log(`\n✅ 생성 권한 확인됨!`);
      } else if (createResponse.statusCode === 403) {
        console.log(`\n❌ 생성 권한 없음: ${createResponse.data.message}`);
        console.log(`   이는 담당 트레이너만 PT 세션을 생성할 수 있음을 의미합니다.`);
      } else if (createResponse.statusCode === 400) {
        console.log(`\n⚠️ 입력값 오류: ${createResponse.data.message}`);
      }
    }

    console.log('\n🎯 권한 테스트 완료!');

  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
  }
}

// 테스트 실행
testPTPermissions().catch(console.error);
