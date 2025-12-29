# 세계 경제 통계 대시보드

World Bank API를 활용하여 각국의 주요 경제 통계를 도표와 그래프로 시각화하는 웹 애플리케이션입니다.

## 🌟 주요 기능

- **다양한 국가 선택**: 미국, 중국, 일본, 독일, 영국, 프랑스, 한국, 인도, 브라질, 러시아 등
- **주요 경제 지표**: 
  - GDP 성장률 (연간 %)
  - 인플레이션율 (연간 %)
  - 실업률 (%)
  - GDP (현재 가격, USD)
  - 경상수지 (GDP 대비 %)
- **시각화**: 선 그래프와 막대 그래프로 데이터 비교
- **기간 선택**: 원하는 연도 범위 선택 가능

## 🚀 사용 방법

1. 국가를 선택합니다
2. 경제 지표를 선택합니다
3. 시작 연도와 종료 연도를 설정합니다
4. "데이터 불러오기" 버튼을 클릭합니다

## 📦 기술 스택

- **HTML5**: 웹 페이지 구조
- **CSS3**: 스타일링 및 반응형 디자인
- **JavaScript**: 데이터 처리 및 API 호출
- **Chart.js**: 그래프 시각화 라이브러리
- **Netlify Functions**: 서버리스 함수로 CORS 문제 해결
- **World Bank API**: 경제 통계 데이터 소스 (무료 공개 API)

## 🌐 배포

이 프로젝트는 Netlify를 통해 배포할 수 있습니다.

### GitHub에 업로드

```bash
# Git 저장소 초기화
git init

# 파일 추가
git add .

# 커밋
git commit -m "Initial commit: IMF 경제 통계 대시보드"

# GitHub 저장소 연결 (your-username과 your-repo-name을 실제 값으로 변경)
git remote add origin https://github.com/your-username/your-repo-name.git

# 푸시
git branch -M main
git push -u origin main
```

### Netlify 배포

1. [Netlify](https://www.netlify.com/)에 로그인합니다
2. "New site from Git"을 클릭합니다
3. GitHub 저장소를 선택합니다
4. 빌드 설정:
   - **Build command**: (비워둠)
   - **Publish directory**: `/` (또는 비워둠)
5. "Deploy site"를 클릭합니다

**중요**: 이 프로젝트는 Netlify Functions를 사용하여 CORS 문제를 해결합니다. 
- `netlify/functions/worldbank-api.js` 파일이 서버 사이드에서 World Bank API를 호출합니다
- Netlify는 자동으로 Functions를 배포하고 `/.netlify/functions/worldbank-api` 엔드포인트로 접근할 수 있게 합니다
- World Bank API는 무료 공개 API이므로 추가 인증 없이 바로 작동합니다

## ⚠️ 주의사항

- **CORS 문제 해결**: Netlify Functions를 사용하여 서버 사이드에서 World Bank API를 호출하므로 CORS 문제가 해결되었습니다
- **Netlify Functions**: `netlify/functions/worldbank-api.js` 파일이 서버리스 함수로 작동합니다
- **World Bank API**: 무료 공개 API로 접근 제한이 없습니다
- **로컬 테스트**: 로컬에서 테스트하려면 Netlify CLI를 사용하거나 `netlify dev` 명령어를 실행하세요

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 🔗 참고 자료

- [World Bank API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392)
- [Chart.js 문서](https://www.chartjs.org/docs/)
- [Netlify 문서](https://docs.netlify.com/)
- [Netlify Functions 문서](https://docs.netlify.com/functions/overview/)

## 🛠️ 로컬 개발

로컬에서 Netlify Functions를 테스트하려면:

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 로컬 개발 서버 실행
netlify dev
```

이렇게 하면 `http://localhost:8888`에서 사이트와 Functions를 함께 테스트할 수 있습니다.

