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

// PT 세션 API 호출 함수
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

// 테스트 실행
async function testPTSessionAPI() {
  try {
    console.log('🔍 김민수 팀장으로 PT 세션 API 테스트\n');
    
    // 1. 저장된 토큰 읽기
    const token = getStoredToken();
    if (!token) {
      console.log('❌ 토큰이 없습니다. 먼저 로그인을 실행해주세요.');
      return;
    }
    
    console.log(`🔑 토큰 읽기 완료: ${token.substring(0, 50)}...`);
    
    // 2. 이태민 멤버 (ID: 1) PT 세션 조회
    const memberId = 1; // 이태민 멤버
    console.log(`\n📡 API 호출 정보:`);
    console.log(`   URL: http://localhost:3001/api/pt-sessions/member/${memberId}`);
    console.log(`   Method: GET`);
    console.log(`   Member ID: ${memberId}`);
    
    console.log(`\n🚀 PT 세션 API 호출 시작...`);
    
    const response = await getPTSessions(memberId, token);
    
    console.log(`\n📊 API 응답:`);
    console.log(`   Status Code: ${response.statusCode}`);
    console.log(`   Success: ${response.data.success}`);
    console.log(`   Message: ${response.data.message}`);
    
    if (response.statusCode === 200 && response.data.success) {
      console.log(`\n✅ API 호출 성공!`);
      
      const { member, pt_sessions, pagination, statistics } = response.data.data;
      
      console.log(`\n👤 멤버 정보:`);
      console.log(`   ID: ${member.id}`);
      console.log(`   이름: ${member.name}`);
      console.log(`   전화번호: ${member.phone}`);
      
      console.log(`\n📋 PT 세션 정보:`);
      console.log(`   총 PT 세션 수: ${pt_sessions.length}개`);
      console.log(`   페이지네이션: ${JSON.stringify(pagination)}`);
      console.log(`   통계: ${JSON.stringify(statistics)}`);
      
      if (pt_sessions.length > 0) {
        console.log(`\n📅 최근 PT 세션 5개:`);
        pt_sessions.slice(0, 5).forEach((session, index) => {
          console.log(`   ${index + 1}. ${session.session_date} (트레이너: ${session.trainer?.name || 'N/A'})`);
        });
      }
      
      console.log('\n✅ 권한 문제가 해결되었습니다!');
      
    } else if (response.statusCode === 403) {
      console.log(`\n❌ 권한 없음: ${response.data.message}`);
      console.log(`   이는 백엔드 권한 로직에 문제가 있음을 의미합니다.`);
      
    } else {
      console.log(`\n❌ API 호출 실패:`);
      console.log(`   Status Code: ${response.statusCode}`);
      console.log(`   Error: ${response.data.message}`);
    }
    
  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
  }
}

// 테스트 실행
testPTSessionAPI().catch(console.error);
