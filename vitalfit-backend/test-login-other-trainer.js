const http = require('http');

// 로그인 API 호출 함수
async function login(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: email,
      password: password
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
async function testLogin() {
  try {
    console.log('🔍 다른 트레이너 로그인 테스트\n');

    // 테스트할 계정들
    const testAccounts = [
      { 
        name: '이영희 트레이너 (강남1팀)', 
        email: 'lee.gangnam1@vitalfit.co.kr', 
        password: 'password123' 
      },
      { 
        name: '홍유진 팀장 (홍대1팀)', 
        email: 'hong.hongdae1@vitalfit.co.kr', 
        password: 'password123' 
      }
    ];

    for (const account of testAccounts) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📋 ${account.name} 로그인 테스트`);
      console.log(`${'='.repeat(60)}`);

      console.log(`\n📡 로그인 요청:`);
      console.log(`   URL: http://localhost:3001/api/users/signin`);
      console.log(`   Method: POST`);
      console.log(`   Email: ${account.email}`);

      const response = await login(account.email, account.password);

      console.log(`\n📊 로그인 응답:`);
      console.log(`   Status Code: ${response.statusCode}`);
      console.log(`   Success: ${response.data.success}`);
      console.log(`   Message: ${response.data.message}`);
      console.log(`   Response Data:`, JSON.stringify(response.data, null, 2));

      if (response.statusCode === 200 && response.data.success) {
        console.log(`\n✅ 로그인 성공!`);
        
        // 응답 구조에 따라 다르게 처리
        const user = response.data.user || response.data.data?.user;
        const token = response.data.token || response.data.data?.token;
        
        if (user) {
          console.log(`   User ID: ${user.id}`);
          console.log(`   Name: ${user.name}`);
          console.log(`   Position: ${user.position?.name || 'N/A'}`);
          console.log(`   Team: ${user.team?.name || 'N/A'}`);
          console.log(`   Center: ${user.center?.name || 'N/A'}`);
        }
        
        if (token) {
          // 토큰 저장
          const fileName = `${account.name.replace(/\s+/g, '-').toLowerCase()}-token.txt`;
          require('fs').writeFileSync(fileName, token);
          console.log(`   Token saved to: ${fileName}`);
        }
      } else {
        console.log(`\n❌ 로그인 실패: ${response.data.message}`);
      }
    }

    console.log('\n🎯 로그인 테스트 완료!');

  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
  }
}

// 테스트 실행
testLogin().catch(console.error);
