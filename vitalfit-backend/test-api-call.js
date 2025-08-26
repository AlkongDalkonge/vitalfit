const jwt = require('jsonwebtoken');
const http = require('http');

// JWT 토큰 생성 함수
function generateToken(userId) {
  const secret = process.env.JWT_SECRET || 'default-secret-key-for-development';
  
  return jwt.sign(
    {
      uid: userId,
      type: 'access',
      rememberMe: false,
    },
    secret,
    { expiresIn: '24h' }
  );
}

// API 호출 테스트 함수
async function testAPICall() {
  try {
    console.log('🔍 김민수 팀장으로 이태민 멤버 PT 세션 API 호출 테스트\n');
    
    // 1. 김민수 팀장 토큰 생성
    const kimMinsuToken = generateToken(2); // 김민수 팀장 ID: 2
    console.log(`🔑 김민수 팀장 토큰 생성 완료`);
    
    // 2. API 호출 설정
    const memberId = 1; // 이태민 멤버 ID
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/pt-sessions/member/${memberId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${kimMinsuToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    console.log(`📡 API 호출 정보:`);
    console.log(`   URL: http://localhost:3001/api/pt-sessions/member/${memberId}`);
    console.log(`   Method: GET`);
    console.log(`   Member ID: ${memberId}`);
    
    // 3. API 호출
    console.log(`\n🚀 API 호출 시작...`);
    
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            // 4. 응답 분석
            console.log(`\n✅ API 호출 성공!`);
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Status Message: ${res.statusMessage}`);
            
            const responseData = JSON.parse(data);
            console.log(`\n📊 응답 데이터:`);
            console.log(`   Success: ${responseData.success}`);
            console.log(`   Message: ${responseData.message}`);
            
            if (responseData.data) {
              const { member, pt_sessions, pagination, statistics } = responseData.data;
              
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
            }
            
            console.log('\n✅ API 호출 테스트 완료!');
            resolve(responseData);
            
          } catch (parseError) {
            console.error('\n❌ 응답 파싱 오류:', parseError.message);
            console.error('Raw response:', data);
            reject(parseError);
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('\n❌ API 호출 실패!');
        console.error(`   Error: ${error.message}`);
        console.error(`   서버가 실행 중인지 확인해주세요.`);
        reject(error);
      });
      
      req.setTimeout(10000, () => {
        console.error('\n❌ API 호출 타임아웃!');
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
    
  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
    throw error;
  }
}

// 테스트 실행
testAPICall().catch(console.error);
