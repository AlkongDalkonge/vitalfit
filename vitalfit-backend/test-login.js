const http = require('http');

// 로그인 API 호출 함수
async function loginUser(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: email,
      password: password,
      rememberMe: false
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/users/signin',
      method: 'POST',
      headers: {
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
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 테스트 실행
async function testLogin() {
  try {
    console.log('🔍 김민수 팀장 로그인 테스트\n');
    
    // 김민수 팀장 로그인 정보 (시드 데이터에서 확인)
    const email = 'kim.gangnam1@vitalfit.co.kr';
    const password = 'password123';
    
    console.log(`📡 로그인 정보:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
    console.log(`\n🚀 로그인 API 호출 시작...`);
    
    const response = await loginUser(email, password);
    
    console.log(`\n📊 로그인 응답:`);
    console.log(`   Success: ${response.success}`);
    console.log(`   Message: ${response.message}`);
    
    if (response.success && response.token) {
      console.log(`\n✅ 로그인 성공!`);
      console.log(`   Token: ${response.token.substring(0, 50)}...`);
      console.log(`   User ID: ${response.user.id}`);
      console.log(`   User Name: ${response.user.name}`);
      console.log(`   Position: ${response.user.position?.name || 'N/A'}`);
      console.log(`   Team: ${response.user.team?.name || 'N/A'}`);
      
      // 토큰을 파일에 저장
      const fs = require('fs');
      fs.writeFileSync('kim-minsu-token.txt', response.token);
      console.log(`\n💾 토큰이 'kim-minsu-token.txt' 파일에 저장되었습니다.`);
      
      return response.token;
    } else {
      console.log(`\n❌ 로그인 실패!`);
      console.log(`   Error: ${response.message}`);
      return null;
    }
    
  } catch (error) {
    console.error('\n❌ 로그인 테스트 오류:', error.message);
    return null;
  }
}

// 테스트 실행
testLogin().catch(console.error);
