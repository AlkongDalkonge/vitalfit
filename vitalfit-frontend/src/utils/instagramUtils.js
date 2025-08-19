// 인스타그램 URL에서 썸네일 정보를 가져오는 유틸리티 함수들

/**
 * URL이 인스타그램 링크인지 확인
 */
export const isInstagramUrl = url => {
  if (!url) return false;
  return url.includes('instagram.com') || url.includes('instagr.am');
};

/**
 * 인스타그램 oEmbed API를 통해 썸네일 정보 가져오기
 */
export const fetchInstagramThumbnail = async url => {
  try {
    // 여러 프록시 서버를 시도
    const proxyServers = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(
        `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`
      )}`,
      `https://cors-anywhere.herokuapp.com/https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`,
      `https://thingproxy.freeboard.io/fetch/https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`,
      `https://cors.bridged.cc/https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`,
      `https://api.codetabs.com/v1/proxy?quest=https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`,
    ];

    for (let i = 0; i < proxyServers.length; i++) {
      try {
        console.log(`프록시 서버 ${i + 1} 시도 중...`);

        const response = await fetch(proxyServers[i]);

        if (!response.ok) {
          console.log(`프록시 서버 ${i + 1} 실패: ${response.status}`);
          continue;
        }

        const data = await response.json();

        if (data.contents) {
          try {
            const instagramData = JSON.parse(data.contents);

            if (instagramData.thumbnail_url) {
              console.log('썸네일 성공적으로 가져옴:', instagramData.thumbnail_url);
              return {
                success: true,
                thumbnail: instagramData.thumbnail_url,
                title: instagramData.title || 'Instagram Post',
                author: instagramData.author_name || 'Instagram User',
                url: url,
              };
            } else {
              console.log('썸네일 URL이 없음');
              return { success: false, error: '썸네일을 찾을 수 없습니다.' };
            }
          } catch (parseError) {
            console.error(`프록시 서버 ${i + 1} JSON 파싱 실패:`, parseError);
            continue;
          }
        }

        console.log(`프록시 서버 ${i + 1}에서 데이터 없음`);
        continue;
      } catch (error) {
        console.error(`프록시 서버 ${i + 1} 에러:`, error);
        continue;
      }
    }

    // 모든 프록시 서버 실패 시 대안 방법 시도
    console.log('모든 프록시 서버 실패, 대안 방법 시도...');

    try {
      // 인스타그램 게시물 ID를 추출하여 직접 썸네일 생성 시도
      const postIdMatch = url.match(/instagram\.com\/p\/([^/?]+)/);
      if (postIdMatch) {
        const postId = postIdMatch[1];
        console.log('게시물 ID 추출:', postId);

        // 방법 1: 인스타그램 임베드 URL (실제로 작동)
        const fallbackThumbnail = `https://www.instagram.com/p/${postId}/embed/captioned/`;

        // 방법 2: SVG 기반 썸네일 (로컬에서 생성, 외부 의존성 없음)
        const svgThumbnail = `data:image/svg+xml;base64,${btoa(`
          <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#833AB4;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#FD1D1D;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#F77737;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="300" height="300" fill="url(#grad1)"/>
            <circle cx="150" cy="120" r="40" fill="white" opacity="0.9"/>
            <rect x="110" y="170" width="80" height="4" fill="white" opacity="0.9"/>
            <rect x="120" y="180" width="60" height="4" fill="white" opacity="0.9"/>
            <text x="150" y="250" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" font-weight="bold">
              Instagram Post
            </text>
            <text x="150" y="270" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">
              ${postId}
            </text>
          </svg>
        `)}`;

        return {
          success: true,
          thumbnail: fallbackThumbnail,
          title: `Instagram Post ${postId}`,
          author: 'Instagram User',
          url: url,
          note: '대안 방법으로 생성된 썸네일입니다. 실제 이미지가 아닐 수 있습니다.',
          fallbackImage: svgThumbnail, // SVG 기반 대체 이미지
        };
      }
    } catch (error) {
      console.error('대안 방법 실패:', error);
    }

    return await extractUrlMetadata(url);
  } catch (error) {
    console.error('Instagram thumbnail fetch error:', error);
    return {
      success: false,
      error: '인스타그램 정보를 가져오는 중 오류가 발생했습니다.',
    };
  }
};

/**
 * URL에서 메타데이터 추출 (대안 방법)
 */
export const extractUrlMetadata = async url => {
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.contents) {
      const html = data.contents;

      // Open Graph 이미지 추출
      const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
      const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
      const ogDescriptionMatch = html.match(/<meta property="og:description" content="([^"]+)"/);

      if (ogImageMatch) {
        return {
          success: true,
          thumbnail: ogImageMatch[1],
          title: ogTitleMatch ? ogTitleMatch[1] : '링크 미리보기',
          description: ogDescriptionMatch ? ogDescriptionMatch[1] : '',
          url: url,
        };
      }
    }

    return { success: false, error: '미리보기 정보를 찾을 수 없습니다.' };
  } catch (error) {
    console.error('URL metadata extract error:', error);

    if (error.message.includes('HTTP error! status: 429')) {
      return { success: false, error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' };
    } else if (error.message.includes('HTTP error! status: 403')) {
      return { success: false, error: '접근이 거부되었습니다.' };
    } else {
      return {
        success: false,
        error: '링크 정보를 가져오는 중 오류가 발생했습니다.',
      };
    }
  }
};

/**
 * URL 타입에 따라 적절한 썸네일 가져오기
 */
export const fetchUrlThumbnail = async url => {
  if (isInstagramUrl(url)) {
    return await fetchInstagramThumbnail(url);
  } else {
    return await extractUrlMetadata(url);
  }
};
