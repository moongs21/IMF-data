// Netlify Serverless Function for IMF API Proxy (Alternative version using Node.js https)
// This version uses Node.js built-in modules instead of fetch

const https = require('https');

exports.handler = async (event, context) => {
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

    return new Promise((resolve) => {
        try {
            // 쿼리 파라미터 추출
            const { indicator, country, startYear, endYear } = event.queryStringParameters || {};

            // 필수 파라미터 검증
            if (!indicator || !country || !startYear || !endYear) {
                resolve({
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ 
                        error: 'Missing required parameters: indicator, country, startYear, endYear' 
                    })
                });
                return;
            }

            // IMF API URL 구성
            const imfApiUrl = `https://www.imf.org/external/datamapper/api/v1/${indicator}/${country}?periods=${startYear}-${endYear}`;

            console.log('IMF API 호출 (https 모듈):', imfApiUrl);

            const url = new URL(imfApiUrl);
            const options = {
                hostname: url.hostname,
                path: url.pathname + url.search,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://www.imf.org/'
                },
                timeout: 20000
            };

            const req = https.request(options, (res) => {
                console.log('IMF API 응답 상태:', res.statusCode, res.statusMessage);

                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        if (res.statusCode !== 200) {
                            console.error('IMF API 오류 응답:', data.substring(0, 500));
                            resolve({
                                statusCode: 500,
                                headers,
                                body: JSON.stringify({
                                    error: 'IMF API error',
                                    message: `HTTP ${res.statusCode}: ${res.statusMessage}`,
                                    details: data.substring(0, 200)
                                })
                            });
                            return;
                        }

                        const jsonData = JSON.parse(data);
                        console.log('IMF API 데이터 수신 성공');

                        resolve({
                            statusCode: 200,
                            headers,
                            body: JSON.stringify(jsonData)
                        });
                    } catch (parseError) {
                        console.error('JSON 파싱 오류:', parseError);
                        resolve({
                            statusCode: 500,
                            headers,
                            body: JSON.stringify({
                                error: 'Failed to parse IMF API response',
                                message: parseError.message,
                                rawData: data.substring(0, 500)
                            })
                        });
                    }
                });
            });

            req.on('error', (error) => {
                console.error('IMF API 요청 오류:', error);
                resolve({
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        error: 'Failed to fetch data from IMF API',
                        message: error.message,
                        code: error.code
                    })
                });
            });

            req.on('timeout', () => {
                console.error('IMF API 요청 시간 초과');
                req.destroy();
                resolve({
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        error: 'IMF API request timeout',
                        message: 'Request took longer than 20 seconds'
                    })
                });
            });

            req.end();

        } catch (error) {
            console.error('IMF API Proxy Error:', error);
            resolve({
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Failed to fetch data from IMF API',
                    message: error.message,
                    stack: error.stack
                })
            });
        }
    });
};

