# soyoon-quest

조카 **소윤**(초등 5학년 2학기)을 위한 로블록스 컨셉 게임형 학습 PWA.

- 라이브: https://jiwater80.github.io/soyoon-quest/ (GitHub Pages, `main` 루트)
- repo: `jiwater80/soyoon-quest`
- 자매 프로젝트: `jiwater80/study-quest`(아들 한윤재), `jiwater80/mandy-quest`(딸 Mandy)

## 구조

배포되는 파일은 repo 루트에 있고, **전부 `build/`에서 생성**됩니다. 루트 파일을 직접 고치지 마세요 — 다음 빌드에서 덮어써집니다.

```
index.html            ← 생성물 (build-soyoon-pwa.mjs 출력)
sw.js                 ← 수동 관리 (CACHE 버전 직접 올림)
manifest.webmanifest
icons/                ← 생성물 (make-icons-soyoon.mjs 출력)
build/
  quest-board.html      리스킨 원본 (한윤재 study-quest 소스)
  sy-mat.json           수학 문항
  sy-sci.json           과학 문항
  sy-soc.json           사회(한국사) 문항
  build-soyoon.mjs      리스킨 + 문항 주입 + 보기 셔플 → soyoon-quest.html
  soyoon-quest.html     중간 생성물 (아티팩트용 단일 HTML)
  build-soyoon-pwa.mjs  PWA 헤드 래핑 → ../index.html
  make-icons-soyoon.mjs 빨강 블록 아이콘 PNG 생성 → ../icons/
  serve-soyoon.mjs      로컬 확인용 정적 서버
```

## 빌드

```bash
node build/build-soyoon.mjs && node build/build-soyoon-pwa.mjs
```

`build-soyoon.mjs`는 통과 시 문항 검증 결과와 정답 인덱스 분포를 출력하고, 검증 실패 시 `exit 1`. 출력의 "N bytes"는 실제로 JS 문자열 길이(문자 수)이며 UTF-8 바이트 수가 아닙니다.

빌드는 결정적입니다 — 입력이 같으면 `index.html`이 바이트 단위로 동일하게 재생성됩니다.

## 콘텐츠 규칙

- 3과목(수학·과학·사회한국사) × **14일 완성표** = 42일. 단원 4개(각 3일) + 복습(D13) + 총정리(D14).
- 문항: 단원 확인문제 **10문항**(Day 3·6·9·12) + 총정리 **20문항**(Day 14) → 과목당 60, 총 **180문항**.
- 문항 형식은 4원소 배열: `[질문, [보기4], 정답인덱스, 해설]`. 네 번째 해설은 필수(빈 문자열이면 빌드 실패).
- 보기 순서는 `build-soyoon.mjs`가 mulberry32 시드 Fisher-Yates로 셔플하고 정답 인덱스를 재매핑합니다. **JSON에 정답을 몰아넣어도 되지만, 셔플 결과 분포를 빌드 출력에서 확인할 것.**

## 보상 / 저장

- 통화는 **한국 원(₩)**. 하루 200 + 단원 800 + 총정리 1000, 목표 20000원(전부 완료 시 21000원).
- 통화·보상 체계를 바꾸면 `REWARD_VERSION`을 올려 마이그레이션시킬 것.
- localStorage: 진행 `soyoon_plan_v1`, 역할 `soyoon_role`. 3인 역할(소윤/엄마/아빠).
- 실시간 동기화: Firebase RTDB `https://learning-soyun-default-rtdb.firebaseio.com`, 경로 `/soyoon.json`. URL은 `build-soyoon.mjs`에 하드코딩돼 있습니다(루트 HTML 아님).

## 배포 시 주의

- **내용이 바뀌면 `sw.js`의 CACHE 이름 버전을 반드시 올릴 것** (안 올리면 기기에 옛 버전이 남습니다). 현재 `soyoon-quest-v3`.
- 아티팩트(claude.ai)에서는 CSP 때문에 Firebase 실시간 동기화가 동작하지 않습니다. Pages 배포본에서만 확인하세요.
