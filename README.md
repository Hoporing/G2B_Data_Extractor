# G2B_Data_Extractor

나라장터(G2B) 입찰공고 상세 페이지에서 규격 Data를 추출하는 Chrome Extension.

---

## 실행 화면

![Demo](docs/demo.gif)
<!-- Demo GIF 또는 Screenshot 추가 후 위 경로 업데이트 -->

---

## 주요 기능

- 입찰공고 상세 페이지에서 규격 내용(addChoice_input) 자동 추출
- 분야별 세부 규격(addChoicePart_input) 추가 추출 (있는 경우)
- 복수 CSS Selector Fallback (동적 페이지 대응)
- 추출 Data를 Background Script에서 Excel로 처리

---

## 설치

1. Chrome → `chrome://extensions/` → 개발자 모드 ON
2. "압축해제된 확장 프로그램을 로드합니다" → 이 폴더 선택

---

## 사용법

나라장터 입찰공고 상세 페이지에서 Extension Icon 클릭 → Data 자동 추출

---

## License

[MIT License](LICENSE)
