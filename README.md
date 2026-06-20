<div align="center">

# HITS Modern Site Renewal

HITS 공식 웹사이트 마이그레이션

React + Vite로 제작한 ㈜에이치아이티에스(HITS) 공식 웹사이트 리뉴얼 프로젝트입니다. 레거시 `highimage.co.kr`의 회사 소개, 제품군, R&D, 홍보센터 콘텐츠를 정적 데이터로 정리하고 한국어/영어/중국어 UI를 제공하는 해시 라우팅 SPA입니다.

![Platform](https://img.shields.io/badge/platform-Web-2563EB)
![React](https://img.shields.io/badge/react-19-61DAFB)
![Vite](https://img.shields.io/badge/vite-7-646CFF)
![Languages](https://img.shields.io/badge/i18n-KR%20%7C%20EN%20%7C%20CN-111827)

[Overview](#overview) · [Features](#features) · [Quick Start](#quick-start) · [Site Map](#site-map) · [Migration](#migration) · [Tech Stack](#tech-stack)

</div>

## Overview

이 저장소는 HITS의 기존 WordPress 기반 사이트를 현대적인 정적 프론트엔드로 이전하기 위한 작업본입니다.

메뉴는 `HOME`, `COMPANY`, `PRODUCTS`, `R&D`, `PR Center`로 구성되어 있으며, 제품 상세 스펙과 회사 연혁, 파트너, R&D 성과, 뉴스 콘텐츠를 `src/data`의 언어별 정적 모듈로 관리합니다. 라우팅은 정적 호스팅에 맞게 hash URL을 사용합니다.

| Area | Best For | Main Contents |
| --- | --- | --- |
| Home | 브랜드 첫 화면과 핵심 기술 소개 | 히어로, 기술 필러, R&D 성과, 사업 영역, 뉴스 |
| Company | 회사 소개 | CEO Message, Business Field, History, Location, Partners |
| Products | 장비/검사/패킹 시스템 탐색 | Automation, Vision Inspection, Packing/Distribution |
| R&D | 기술 경쟁력 소개 | Performance, Key Technology, Core Competencies |
| PR Center | 회사 소식 | PR Center, HITS News |

## Features

| Feature | Description |
| --- | --- |
| 정적 SPA | Vite 기반 React 앱으로 빌드 후 `dist/`만 정적 호스팅하면 실행됩니다. |
| 해시 라우팅 | 서버 rewrite 설정 없이 `#/company/history` 같은 URL로 하위 페이지를 이동합니다. |
| 다국어 데이터 | 한국어, 영어, 중국어 콘텐츠와 UI 문구를 `src/data`와 `src/i18n.jsx`에서 분리 관리합니다. |
| 제품 브라우저 | Automation, Vision, Packing/Distribution 카테고리와 장비별 상세 정보를 탐색합니다. |
| 메가 메뉴 | 데스크톱 전체 메뉴와 모바일 오버레이 메뉴를 같은 메뉴 모델에서 렌더링합니다. |
| 검색 오버레이 | 제품, 기술, 메뉴, 파트너, 뉴스 항목을 통합 검색합니다. |
| 콘텐츠 인벤토리 | 레거시 사이트의 메뉴/페이지/이미지 출처를 `docs/CONTENT-INVENTORY.md`에 정리했습니다. |
| 마이그레이션 점검 | 누락 또는 재검토가 필요한 항목은 `docs/GAP-REPORT.md`에서 추적합니다. |

## Quick Start

```bash
npm install
npm run dev
```

개발 서버는 Vite 기본 포트인 `5173`에서 열립니다. 외부 기기 확인을 위해 `package.json`의 개발 스크립트는 `--host 0.0.0.0` 옵션을 사용합니다.

프로덕션 빌드는 다음 명령으로 확인합니다.

```bash
npm run build
npm run preview
```

## Site Map

| Route | Page |
| --- | --- |
| `#/` | Home |
| `#/company/ceo` | CEO Message |
| `#/company/business` | Business Field |
| `#/company/history` | History |
| `#/company/location` | Location |
| `#/company/partners` | Partners |
| `#/products` | Product Overview |
| `#/products/automation` | Automation Systems |
| `#/products/vision` | Vision Inspection Systems |
| `#/products/packing` | Packing / Distribution Systems |
| `#/rnd/performance` | R&D Performance |
| `#/rnd/key-technology` | Key Technology |
| `#/rnd/core-competencies` | Core Competencies |
| `#/pr` | PR Center |
| `#/pr/news` | HITS News |

## Migration

레거시 콘텐츠는 크롤 결과를 바탕으로 정리했지만, 원본 크롤 폴더는 용량이 크고 재생성 가능한 작업 산출물이므로 저장소 커밋 대상에서 제외했습니다.

| Path | Role |
| --- | --- |
| `src/data/content.kr.js` | 한국어 기준 콘텐츠 데이터 |
| `src/data/content.en.js` | 영어 콘텐츠 데이터 |
| `src/data/content.cn.js` | 중국어 콘텐츠 데이터 |
| `src/data/ui.js` | 메뉴, CTA, 접근성 문구 등 UI 문자열 |
| `public/assets/` | 런타임에서 직접 참조하는 공개 이미지 아카이브 |
| `docs/CONTENT-INVENTORY.md` | 레거시 콘텐츠 원천과 페이지별 구조 기록 |
| `docs/GAP-REPORT.md` | 마이그레이션 검수 및 보강 후보 기록 |

로컬 작업 중 생성된 `highimage-crawl/`, `highimage-crawl-v2/`, `dist/`, `node_modules/`, `__pycache__/`는 `.gitignore`에 포함되어 있습니다.

## Tech Stack

| Layer | Technology | Role |
| --- | --- | --- |
| App | React 19 | 컴포넌트 기반 UI |
| Build | Vite 7 | 개발 서버와 정적 번들 |
| Icons | lucide-react | 메뉴, 검색, 연락처 아이콘 |
| Routing | Hash URL | 정적 호스팅 친화적 페이지 전환 |
| Content | ES Modules | 언어별 정적 콘텐츠 데이터 |
| Styling | CSS | 반응형 레이아웃, 디자인 토큰, 모션 |

## Repository Structure

```text
.
|-- docs/
|   |-- CONTENT-INVENTORY.md
|   `-- GAP-REPORT.md
|-- public/
|   `-- assets/
|-- scripts/
|   |-- crawl_highimage.py
|   `-- crawl_highimage_menu_deep.py
|-- src/
|   |-- data/
|   |-- hooks/
|   |-- i18n.jsx
|   |-- main.jsx
|   `-- styles.css
|-- index.html
|-- package-lock.json
|-- package.json
`-- README.md
```

## Build From Source

```bash
npm install
npm run build
```

빌드 결과는 `dist/`에 생성됩니다. GitHub Pages, Netlify, Vercel, 사내 정적 호스팅 등에 올릴 때는 `dist/`의 정적 파일을 배포하면 됩니다.

## Source Environment

소스 빌드와 검수에는 다음 환경을 권장합니다.

| Item | Role |
| --- | --- |
| Node.js 20+ | Vite 7 실행 환경 |
| npm | 의존성 설치 및 스크립트 실행 |
| Modern Browser | Chrome, Edge, Safari, Firefox 계열 검수 |

## Caution

- `public/assets/`는 앱에서 직접 참조하는 런타임 자산이므로 커밋 대상입니다.
- `dist/`는 빌드 산출물이므로 커밋하지 않습니다.
- 원본 크롤 스냅샷은 로컬 재생성 산출물로 보고 `.gitignore`에서 제외합니다.
- 콘텐츠 보강 전에는 `docs/GAP-REPORT.md`의 검수 항목을 먼저 확인하세요.
