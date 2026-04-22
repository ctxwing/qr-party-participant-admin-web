# BackBlaze
- 무료 10GB 스토리지 제공
- ctxwing@gmail.com
- https://secure.backblaze.com/b2_buckets.htm

# 업로드 외부 공개 
## 1. Private Bucket 이지만,  Presigned URL (미리 서명된 URL) 사용 (추천 ⭐) :
- 버킷은 Private으로 유지하면서, 특정 파일에 대해서만 일정 시간(예: 10분) 동안 접근 가능한 임시 URL을 생성하여 claid.ai에 보내는 방식입니다.
- 장점: 보안이 매우 강력하며, 작업이 끝나면 URL이 자동으로 만료됩니다.
- 방법:  서버나 개발 환경에서 Python(boto3 라이브러리 등)을 사용해 URL을 생성할 수 있습니다.

## 2. Public Bucket 사용
- 버킷을 Public으로 설정하여 누구나 접근할 수 있도록 합니다.
- 장점: 설정이 매우 간단하며, 별도의 URL 생성 과정이 필요 없습니다.
- 단점: 보안이 취약하며, 악의적인 사용자가 파일을 다운로드하거나 악용할 수 있습니다.
- Public(공공) 설정 후 파일명 난독화
만약 매번 URL을 생성하는 로직을 짜기 번거롭다면 버킷을 **공공(Public)**으로 설정할 수 있습니다.

주의사항: 누구나 URL만 알면 파일을 볼 수 있습니다.

보완책: 파일명을 user123_abc123456789.jpg와 같이 길고 복잡하게(UUID 활용) 만들어 추측하기 어렵게 관리해야 합니다.

## 생성 사례
photo-refine-ai-ochestrator-saas 
생성:March 26, 2026
물통 ID:cceedff79255267098d5081c
종류:Private
파일의 수명 주기:Keep all versions
스냅샷:0
현재파일:0
현재 기가바이트:0 bytes
Endpoint:s3.us-west-004.backblazeb2.com
암호화:Disabled
업로드/다운로드
Bucket Settings 물통 설정
Lifecycle Settings 수명 주기 설정
CORS Rules CORS 규칙
Object Lock Object Lock: disabled
Event Notifications Event Notifications
## 🚨 API Key 발급 및 설정 방법 (B2용 Credentials)

현재 백엔드 코드(`storage.py`)는 아래 두 가지 키가 `.env`에 등록되어야 클라우드 스토리지를 통한 테스트가 가능합니다.

1. **발급 절차**:
   - [Backblaze B2 DashBoard > App Keys](https://secure.backblaze.com/app_keys.htm) 메뉴 접속.
   - **`Add a New Application Key`** 버튼 클릭.
   - **Name of Key**: `photo-refine-ai-saas` (식별용 이름 입력)
   - **Allow Access to Bucket(s)**: `photo-refine-ai-ochestrator-saas` 선정 (보안을 위해 추천).
   - **Type of Access**: `Read and Write` 선택.
   - 생성 완료 후 화면에 나타나는 **`keyID`**와 **`applicationKey`**를 즉시 안전한 곳에 복사해 두어야 합니다 (Application Key는 생성 직후 한 번만 보여줌).

2. **백엔드 환경 변수 반영 리스트**:
   - `B2_KEY_ID`: 생성된 **keyID** 값
   - `B2_APP_KEY`: 생성된 **applicationKey** 값
   - `B2_BUCKET`: `photo-refine-ai-ochestrator-saas`
   - `B2_ENDPOINT`: `s3.us-west-004.backblazeb2.com` (물통 설정에서 확인 가능)
---
# 20260326 10:12 
Success! Your new application key has been created. It will only appear here once.
bucketName:
photo-refine-ai-ochestrator-saas

keyID:
004cef72560858c0000000002
keyName:
photo-refine-ai-saas
applicationKey:
K004Vvr2Qq7+yDbm4nrz/JLZaeDhaBc

---
**최종 수정일**: 2026-03-26  
**담당**: ctxwing@gmail.com