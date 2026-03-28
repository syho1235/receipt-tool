# 📄 영수증 자동 입력 도구

소년 2마을 26년 3월 예산 양식 자동 입력 도구입니다.

---

## 🚀 배포 방법 (Vercel)

### 1단계: GitHub 계정 만들기
- [github.com](https://github.com) → Sign up

### 2단계: 새 저장소 만들기
- 로그인 후 우상단 `+` → `New repository`
- Repository name: `receipt-tool`
- `Create repository` 클릭

### 3단계: 파일 올리기
- `uploading an existing file` 클릭
- 이 폴더의 파일들을 모두 업로드
- `Commit changes` 클릭

### 4단계: Vercel 연결
- [vercel.com](https://vercel.com) → Continue with GitHub
- `New Project` → `receipt-tool` 선택 → `Import`

### 5단계: API 키 설정 (중요!)
- `Environment Variables` 섹션에서:
  - Name: `ANTHROPIC_API_KEY`
  - Value: `sk-ant-...` (Anthropic Console에서 발급)
- `Deploy` 클릭

### 6단계: 완료!
- 배포 완료 후 URL을 부서원들에게 공유하세요 🎉

---

## 💰 비용 안내
- Vercel 호스팅: **무료**
- Anthropic API: 영수증 1건당 약 1~2원
- GitHub: **무료**

---

## 📞 문의
API 키 발급: [console.anthropic.com](https://console.anthropic.com)
