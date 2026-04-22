# Pexels 
- API 키는 공식 API 개발자 페이지를 통해 즉시 무료로 발급받을 수 있습니다. 복잡한 심사 과정 없이 계정 생성과 간단한 정보 입력만으로 바로 사용이 가능합니다.
- https://www.pexels.com/ko-kr/api/documentation/
- 가입: https://www.pexels.com/join-consumer/
- API 키 발급: https://www.pexels.com/api/keys/

## 발급내역
- 2026.03.03
- API NAME: videoeditor-canva-capcut-style-web-deskto
- API KEY : 1TdfNUtI7lmFYQmxDRe6olIycZlLlbtAOJAEuo7PAO1ti0Ok0JK0paaD

## API 키 발급 절차
Pexels API 페이지에 접속하여 회원가입 또는 로그인을 진행한 후, 가입한 이메일 주소로 전송된 메일을 통해 계정 인증을 완료해야 합니다. 인증 완료 후 우측 상단의 계정 설정(Settings)에서 'Image and Video API' 메뉴로 이동하여 애플리케이션 이름, URL, 사용 목적 등을 간단하게 작성합니다. 마지막으로 Pexels의 서비스 약관 및 API 가이드라인에 동의한 후 발급 버튼(Generate API Key)을 누르면 고유한 API 키가 즉시 생성됩니다.

## 사용 요금 및 호출 한도
Pexels API는 비용 청구 없이 무료로 제공되며, 기본적으로 시간당 200회 및 월간 20,000회의 API 호출 한도가 적용됩니다. 만약 운영 중인 서비스의 트래픽이 높아 한도 상향이 필요하다면 추가 요청을 통해 호출 제한을 해제할 수 있습니다. 단, 무제한 한도를 승인받으려면 Pexels의 출처 표기(Attribution) 규정과 같은 특정 사용 조건을 충족하고 검수를 거쳐야 합니다.

## 개발 연동 시 참고 사항
발급받은 API 키를 실제 코드에 적용할 때는 HTTP 요청 헤더의 Authorization 필드에 해당 키 값을 포함하여 전송해야 합니다. 소스 코드 보안을 위해 API 키는 .env 파일 내에 PEXELS_API_KEY와 같은 환경 변수 형태로 저장하는 것이 권장되며, Git 등을 통해 외부 저장소에 노출되지 않도록 주의해야 합니다