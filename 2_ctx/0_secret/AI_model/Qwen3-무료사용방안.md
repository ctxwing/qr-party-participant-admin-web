Qwen3‑VL / Qwen3.5‑VL 모두 **1순위: 외부 무료 API**, **2순위: 도커/로컬**로 쓸 수 있는 경로가 있습니다. [deepinfra](https://deepinfra.com/Qwen/Qwen3-VL-8B-Instruct/api)

***

## 1순위: 외부 “무료” API로 쓰는 방법

### A. OpenRouter 기반 Qwen3 계열 무료 슬롯

여러 Qwen3 계열(텍스트·멀티모달)이 OpenRouter에서 `:free` 모델로 제공되고, OpenAI 호환 `/v1/chat/completions`로 호출 가능합니다. [openrouter](https://openrouter.ai/qwen/qwen3-coder:free)

1. 절차 개요  
   - OpenRouter 가입 → API 키 발급. [dev](https://dev.to/fallon_jimmy/how-to-use-qwen3-apis-for-free-step-by-step-instructions-4i1g)
   - `https://openrouter.ai/api/v1/chat/completions` 엔드포인트 사용. [dev](https://dev.to/fallon_jimmy/how-to-use-qwen3-apis-for-free-step-by-step-instructions-4i1g)
   - `model` 필드에 Qwen3 계열 `:free` 모델 지정 (예: `qwen/qwen3-4b:free`, 추후 VL 계열 `:free` 슬롯도 동일 방식). [openrouter](https://openrouter.ai/qwen/qwen3-4b:free)

2. 요청 예시 (이미지+텍스트 멀티모달 형태, Node.js/파이썬 어디서나 동일 패턴)  
   ```http
   POST https://openrouter.ai/api/v1/chat/completions
   Authorization: Bearer YOUR_API_KEY
   Content-Type: application/json

   {
     "model": "qwen/qwen3-4b:free",
     "messages": [
       {
         "role": "user",
         "content": [
           { "type": "text", "text": "이 이미지에서 무엇이 보이는지 설명해줘." },
           { "type": "image_url", "image_url": { "url": "https://example.com/sample.jpg" } }
         ]
       }
     ]
   }
   ```  
   OpenRouter는 OpenAI 형식 그대로 받아서, 특정 Qwen3 모델에 라우팅합니다. [openrouter](https://openrouter.ai/qwen/qwen3-4b:free)

3. 특징  
   - 장점: 인프라 필요 없음, OpenAI SDK 그대로 재사용 가능, 일부 모델은 “$0/M tokens”로 명시된 무료 플랜 제공. [openrouter](https://openrouter.ai/qwen/qwen3-coder:free)
   - 단점: 무료 모델은 **요청 속도 제한·우선순위 낮음** 등이 있어 트래픽 많은 서비스에는 부적합. [apidog](https://apidog.com/blog/use-qwen3-apis-free/)

> Qwen3‑VL / 3.5‑VL이 OpenRouter에서 `:free` 슬롯으로 언제·어떤 사이즈가 열려 있는지는 수시로 바뀌므로, 실제 사용 전 모델 페이지를 반드시 확인해야 합니다. [pricepertoken](https://pricepertoken.com/pricing-page/provider/qwen)

***

### B. NVIDIA build.nvidia.com 의 Qwen3.5 VLM 무료 엔드포인트

NVIDIA Developer Program에 가입하면, `build.nvidia.com`에서 Qwen3.5 VLM을 **GPU 가속 엔드포인트로 무료 체험**할 수 있습니다. [developer.nvidia](https://developer.nvidia.com/blog/develop-native-multimodal-agents-with-qwen3-5-vlm-using-nvidia-gpu-accelerated-endpoints/)

1. 절차  
   - NVIDIA Developer Program 가입 → build.nvidia.com 접속 → Qwen3.5 VLM 모델 선택. [developer.nvidia](https://developer.nvidia.com/blog/develop-native-multimodal-agents-with-qwen3-5-vlm-using-nvidia-gpu-accelerated-endpoints/)
   - API 키 발급 후, `https://integrate.api.nvidia.com/v1/chat/completions` 사용. [developer.nvidia](https://developer.nvidia.com/blog/develop-native-multimodal-agents-with-qwen3-5-vlm-using-nvidia-gpu-accelerated-endpoints/)

2. 호출 예시 (Python)  
   ```python
   import requests

   invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
   headers = {
       "Authorization": "Bearer YOUR_NVIDIA_API_KEY",
       "Accept": "application/json",
   }
   payload = {
     "model": "qwen/qwen3.5-397b-a17b",
     "messages": [
       {"role": "user", "content": "이 이미지를 분석해줘."}
     ],
     "stream": False,
     "max_tokens": 2048
   }

   resp = requests.post(invoke_url, headers=headers, json=payload)
   print(resp.json())
   ``` [developer.nvidia](https://developer.nvidia.com/blog/develop-native-multimodal-agents-with-qwen3-5-vlm-using-nvidia-gpu-accelerated-endpoints/)  

3. 특징  
   - 장점: 대형 Qwen3.5 VLM을 GPU 인프라 없이 테스트 가능, Vision 기능 포함 멀티모달 분석 가능. [developer.nvidia](https://developer.nvidia.com/blog/develop-native-multimodal-agents-with-qwen3-5-vlm-using-nvidia-gpu-accelerated-endpoints/)
   - 단점: “개발용 무료 크레딧/쿼터” 성격이라 **완전 무제한 상용 서비스**에는 적합하지 않음. [developer.nvidia](https://developer.nvidia.com/blog/develop-native-multimodal-agents-with-qwen3-5-vlm-using-nvidia-gpu-accelerated-endpoints/)

**공식 링크**  
- NVIDIA Qwen3.5 VLM 안내: https://developer.nvidia.com/blog/develop-native-multimodal-agents-with-qwen3-5-vlm-using-nvidia-gpu-accelerated-endpoints/ [developer.nvidia](https://developer.nvidia.com/blog/develop-native-multimodal-agents-with-qwen3-5-vlm-using-nvidia-gpu-accelerated-endpoints/)

***

### C. 기타 “무료 Qwen API 게이트웨이”

- Puter.js 기반 “Free, Unlimited Qwen API” 튜토리얼: Puter 플랫폼에서 Qwen 계열 모델을 무료로 호출하는 예제가 있습니다. [developer.puter](https://developer.puter.com/tutorials/free-unlimited-qwen-api/)
  - https://developer.puter.com/tutorials/free-unlimited-qwen-api/ [developer.puter](https://developer.puter.com/tutorials/free-unlimited-qwen-api/)

- Apidog 튜토리얼: OpenRouter에 붙여 Qwen3‑30B / 235B를 무료 티어에서 호출하는 단계별 설명. [apidog](https://apidog.com/blog/use-qwen3-apis-free/)

***

## 2순위: 도커/로컬로 Qwen3‑VL / Qwen3.5‑VL 사용

여기서는 **“API 서버 형태로 띄워서 VSC/AG에서 HTTP로 물리는 패턴”** 기준으로 정리합니다. [huggingface](https://huggingface.co/Qwen/Qwen3.5-0.8B)

### A. Qwen3‑VL 로컬 HTTP 서버

1. 모델 다운로드/런타임  
   - 기본은 Hugging Face + vLLM/SGLang 또는 Qwen 공식 도커 이미지. [github](https://github.com/QwenLM/Qwen3-VL)
   - 예: Hugging Face `Qwen/Qwen3-VL-8B-Instruct`. [docs.kanaries](https://docs.kanaries.net/articles/qwen3-vl)

2. vLLM로 OpenAI 호환 서버 실행 예 (단일 GPU 기준)  
   ```bash
   pip install vllm

   python -m vllm.entrypoints.openai.api_server \
      --model Qwen/Qwen3-VL-8B-Instruct \
      --port 8000 \
      --host 0.0.0.0 \
      --gpu-memory-utilization 0.9 \
      --trust-remote-code
   ```  
   이렇게 띄우면 `http://localhost:8000/v1` 에 OpenAI 호환 엔드포인트가 생깁니다. [docs.vllm](https://docs.vllm.ai/en/stable/models/supported_models/)

3. 도커식 실행(개념 예시)  
   ```bash
   docker run --gpus all --rm -p 8000:8000 \
     -e VLLM_MODEL=Qwen/Qwen3-VL-8B-Instruct \
     vllm/vllm-openai:latest
   ```  
   (실제 태그/환경변수는 vLLM 공식 문서·Qwen3‑VL README 참고) [github](https://github.com/QwenLM/Qwen3-VL)

4. 클라이언트에서 호출 (OpenAI compatible)  
   ```bash
   curl http://localhost:8000/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{
       "model": "Qwen/Qwen3-VL-8B-Instruct",
       "messages": [{
         "role": "user",
         "content": [
           {"type": "text", "text": "이 사진 설명해줘"},
           {"type": "image_url", "image_url": {"url": "file:///data/image.jpg"}}
         ]
       }]
     }'
   ``` [huggingface](https://huggingface.co/Qwen/Qwen3.5-0.8B)  

**공식/레포 링크**  
- GitHub: https://github.com/QwenLM/Qwen3-VL [github](https://github.com/QwenLM/Qwen3-VL)
- 예시 HF 카드: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct [docs.kanaries](https://docs.kanaries.net/articles/qwen3-vl)
- vLLM 지원 모델 목록: https://docs.vllm.ai/en/stable/models/supported_models/ [docs.vllm](https://docs.vllm.ai/en/stable/models/supported_models/)

***

### B. Qwen3.5‑VL 로컬 HTTP 서버

Qwen3.5도 Hugging Face에서 “로컬 API 서버 띄우기” 예제가 제공되며, Qwen Agent 예제 코드까지 포함되어 있습니다. [huggingface](https://huggingface.co/Qwen/Qwen3.5-0.8B)

1. HF 카드의 API 서버 예제  
   - `Qwen/Qwen3.5-0.8B` 설명 중: 아래 명령으로 `http://localhost:8000/v1`에 OpenAI 호환 엔드포인트 생성. [huggingface](https://huggingface.co/Qwen/Qwen3.5-0.8B)
   - (카드 내용 요약)  
     - “다음 명령으로 최대 262k 컨텍스트의 API 엔드포인트를 생성할 수 있다. 엔드포인트는 `http://localhost:8000/v1` …” [huggingface](https://huggingface.co/Qwen/Qwen3.5-0.8B)

2. Qwen Agent에서 로컬 서버 붙이는 코드 예시  
   ```python
   import os
   from qwen_agent.agents import Assistant

   llm_cfg = {
     "model": "Qwen/Qwen3.5-0.8B",
     "model_type": "qwenvl_oai",
     "model_server": "http://localhost:8000/v1",
     "api_key": "EMPTY",
     "generate_cfg": {
       "use_raw_api": True,
     },
   }

   bot = Assistant(llm=llm_cfg, function_list=[])
   messages = [{"role": "user", "content": "이미지 분석 도와줘"}]
   for resp in bot.run(messages=messages):
       pass
   print(resp)
   ``` [huggingface](https://huggingface.co/Qwen/Qwen3.5-0.8B)  

3. 도커/서버 사용 시 팁  
   - RTX 2070 8GB:  
     - Qwen3‑VL 8B / Qwen3.5‑VL 4B/9B 정도를 **4bit 양자화**로 돌리는 구성이 현실적.  
   - ctx‑tower (64GB, 2070 8GB) 구조:  
     - vLLM + Qwen3‑VL(8B) 하나, Qwen3.5‑VL(4B) 하나를 각각 포트 다르게 띄워서 멀티엔드포인트 구성.  

**HF/문서 링크**  
- Qwen3.5 예시 카드: https://huggingface.co/Qwen/Qwen3.5-0.8B [huggingface](https://huggingface.co/Qwen/Qwen3.5-0.8B)

***

## 정리: “무료 사용” 전략

1. 외부 무료 API (우선 사용)  
   - **Qwen3 계열**  
     - OpenRouter `:free` 모델 활용 (텍스트/멀티모달 Qwen3, 일부 VL 포함 가능) → 개발·테스트·저트래픽 프로토타입. [openrouter](https://openrouter.ai/qwen/qwen3-coder:free)
   - **Qwen3.5‑VL**  
     - NVIDIA build.nvidia.com Qwen3.5 VLM 무료 엔드포인트 → 품질 테스트·PoC. [developer.nvidia](https://developer.nvidia.com/blog/develop-native-multimodal-agents-with-qwen3-5-vlm-using-nvidia-gpu-accelerated-endpoints/)

2. 도커/로컬 (본격 서비스용)  
   - Qwen3‑VL 8B를 vLLM/SGLang + 도커로 띄워 OpenAI 호환 `/v1` 엔드포인트 제공. [docs.vllm](https://docs.vllm.ai/en/stable/models/supported_models/)
   - Qwen3.5‑VL 4B/0.8B를 같은 방식으로 띄워, 멀티모달·일반 LLM까지 한 서버에서 처리. [huggingface](https://huggingface.co/Qwen/Qwen3.5-0.8B)

원하면, **“iMac에서 VSC/AG로 개발 → ctx‑tower에 Qwen3‑VL 도커 배포 → 로컬·외부 무료 API를 동시에 fallback”** 하는 실제 코드/구성 YAML까지 이어서 짜줄게.