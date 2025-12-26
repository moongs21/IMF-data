// Netlify Serverless Function for IMF API Proxy
// This function runs server-side, avoiding CORS issues

exports.handler = async (event, context) => {
    // 초기 로그
    console.log('Function 호출됨:', {
        method: event.httpMethod,
        path: event.path,
        queryString: event.queryStringParameters
    });
    // CORS 헤더 설정
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // OPTIONS 요청 처리 (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // GET 요청만 허용
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // 쿼리 파라미터 추출
        const { indicator, country, startYear, endYear } = event.queryStringParameters || {};

        // 필수 파라미터 검증
        if (!indicator || !country || !startYear || !endYear) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Missing required parameters: indicator, country, startYear, endYear' 
                })
            };
        }

        // IMF API URL 구성
        const imfApiUrl = `https://www.imf.org/external/datamapper/api/v1/${indicator}/${country}?periods=${startYear}-${endYear}`;

        console.log('IMF API 호출 시작:', imfApiUrl);
        console.log('파라미터:', { indicator, country, startYear, endYear });

        // IMF API 호출 (타임아웃 60초 - Background Functions는 최대 15분까지 가능)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        
        let response;
        try {
            console.log('fetch 호출 시작...');
            response = await fetch(imfApiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://www.imf.org/'
                },
                signal: controller.signal,
                redirect: 'follow'
            });
            clearTimeout(timeoutId);
            console.log('fetch 완료, 상태:', response.status);
        } catch (fetchError) {
            clearTimeout(timeoutId);
            console.error('fetch 오류:', fetchError);
            if (fetchError.name === 'AbortError') {
                throw new Error('IMF API 호출 시간 초과 (60초)');
            }
            throw new Error(`IMF API 네트워크 오류: ${fetchError.message} (${fetchError.name})`);
        }

        console.log('IMF API 응답 상태:', response.status, response.statusText);

        if (!response.ok) {
            let errorText = '';
            try {
                errorText = await response.text();
            } catch (e) {
                errorText = '응답 본문을 읽을 수 없습니다';
            }
            console.error('IMF API 오류 응답:', errorText);
            throw new Error(`IMF API error: ${response.status} ${response.statusText}. ${errorText.substring(0, 200)}`);
        }

        let data;
        try {
            data = await response.json();
            console.log('IMF API 데이터 수신 성공');
        } catch (parseError) {
            throw new Error(`IMF API 응답 파싱 오류: ${parseError.message}`);
        }

        // 성공 응답 반환
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('IMF API Proxy Error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error name:', error.name);
        
        // 더 자세한 에러 정보 반환
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to fetch data from IMF API',
                message: error.message,
                details: error.stack || error.toString(),
                name: error.name
            })
        };
    }
};

