# HITS Renewal Gap Report

Comparison target: `src/data/siteContent.js` plus the observed render logic in `src/main.jsx`. The current renewal uses `cleanBlocks` caps, `skipText`, `noisyPatterns`, custom summaries/cards, and image overrides; product equipment sections are extracted as title + subtitle + 7 text bullets at most, then the product browser displays only the first 5 bullets.

## Current curation behavior that causes loss
- `cleanBlocks(blocks, limit = 7)` removes shared labels and stops at `limit`; most pages use 7 or 8 blocks, product sections use 9 blocks total.
- `skipText` removes labels such as `PRODUCT`, `PRODUCTS`, `COMPANY`, `RND`, `NEWS`, `AUTOMATION SYSTEM`, `VISION INSPECTION SYSTEM`, and `PACKING / DISTRIBUTION SYSTEM`.
- `noisyPatterns` removes product-list text beginning with `Auto Loader / Unloader Substrate Split`, `Human Error Auto Detection IR Crack`, and `Inline Tray Auto Packing Inline Reel`; those lines contain real product names on the legacy overview.
- `pageImages` is bypassed when a hardcoded image is supplied for non-product pages, so most crawl images on company/RND/PR/news pages are dropped.
- `pageProductSections` drops common hero images (`430.jpg`, `430_1-1.jpg`) and truncates each equipment section after 9 cleaned text blocks.
- `DetailPage` displays all extracted product-section bullets, but no product section can contain more than 7 bullets after title/subtitle. `ProductBrowser` and home compact product rail display only 5 and 2 bullets respectively.

## Dropped or truncated facts

### HOME
- `home`: the renewal HomePage is custom copy, not the crawled Home page. Dropped exact legacy hero facts: `TO KOREA AND BYOND`, `HITS는 혁신과 도전을 통해 전 세계로 확장하는 장비 및 비전 회사`, `그 이상의 가치를 실현하겠습니다.`
- `home`: dropped exact technology copy: `생산라인의 Full Automation을`, `위한 SECS-GEM 제어기술을 접목한`, `“Automation System”`, `생산제품의 품질과 수율 극대화를 위한`, `Deep Learning 알고리즘을 적용시킨`, `“Powerful Vision System”`, `생산제품의 출하단계에서`, `발생될 수 있는 Human Error를 Zero화`, `하기위한 “Packing Automation”`, `다양한 첨단 산업에서 HITS의 기술력이 그 진가를 발휘하고 있습니다.`, `Creative Leader for Automation & Vision Inspection`.
- `home`: legacy news preview date/comment fragments are not preserved as shown: `10 / 4월 2020 / 0`, `24 / 10월 2019 / 0`, `05 / 4월 2017 / 0`, `27 / 10월 2014 / 0`.

### COMPANY
- `business-field`: current renewal invents three business field cards (`Automation System`, `Vision Inspection`, `Packing / Distribution`) that do not match the legacy image card labels. The crawl text exposes `세계 반도체/디스플레이` and `장비산업을 선도하는 글로벌 기업`; the image itself carries four card facts that should be restored as text: `Automation / Semiconductor & Display Equipment / EQUIPMENT`, `A.I Inspection / Deep Learning Technology / VISION AI`, `Packing Inline / Tray & Reel Auto-Packing / (SECS-GEM) / PACKING`, `Smart Factory / Robot + 5G`.
- `location`: current company detail preserves address/phone/email/directions, but drops `길찾기`, `CONTACTS`, and the actual map/Kakao map images.
- `partners`: current data exposes partner logos, but not readable partner names. The names must be restored as text for content/accessibility: SAMSUNG SDI, SAMSUNG, LG Display, SK hynix, 3M, STATSChipPAC, Texas Instruments, SimTech, Amkor Technology, meerecompany.
- `ceo-greeting`: full CEO body is exposed, but current `stats` (`1999`, `LCD`, `RND`) are curated/inferred snippets, not crawl blocks.

### PRODUCTS overview and category pages
- `over-view`: not exposed as its own legacy page/slug. The current `/products` page is custom and drops the exact overview headline: `20년간의 장비 기술력으로 반도체, 디스플레이 분야` / `생산성 향상과 품질 개선을 책임집니다.`
- `over-view`: `noisyPatterns` would remove real overview product-list blocks. Missing product names/categories from current `productGroups.details`: `Auto Bake Oven`, `Wafer Sorter`, `Wafer Edge Plasma Etching`, `Wafer Inspection`, `Inline Auto Packing System`, `Storage`.
- `automated-system`: current product group summary is custom and drops the exact legacy text: `20년간의 장비 기술력으로` / `반도체, 디스플레이 분야 생산성 향상과 품질 개선을 책임집니다.`
- `vision-system`: current product group summary is custom and drops the exact legacy text: `품질을 책임지는 Vision Inspection System 20년간의 Vision 기술력으로` / `반도체, 디스플레이 분야 품질 개선을 책임집니다.`
- `packing-distribution-system`: only the shared product hero remains in the crawl; current group summary is custom.

### PRODUCTS detail extraction cap: facts cut after title + subtitle + 7 bullets
- `assembly-tester` / Assembly Tester System – Loader/Sorter: dropped `Composition : Inlet Shuttle Buffer, Balance Buffer, PnP, Reject Discharge, Outlet Shuttle Buffer`.
- `human-error-auto-detection`: dropped `Separation PnP, Human Error Inspection, Reject Port, Desiccant/Pink Foam Insertion,` and `Assembly PnP, Module Tray Unloading Buffer, Module Tray Unloading`.
- `inline-reel-auto-packing-system`: dropped composition tail `Composition : Reel Cassette Loading Conveyor, Rotary Reel Pole Loading,`, `Reel/MBB/Box Label/Sticker Attachment, HIC Loading, Desiccant Loading,`, `MBB Loading, MBB Sealing, Bubble sheet Loading, Box Folding,`, `Box Packing, Seal Tape Attachment, Box Unloading`.
- `inline-tray-auto-packing-system`: dropped composition tail `Label Printing/Loading, End cap Loading, PP Banding, HIC Loading, Desiccant Loading,`, `MBB Loading, MBB Sealing, MBB Folding Bubble sheet Loading,`, `Box Folding, Box Packing, Seal Sticker Attachment, Box Unloading`.
- `ir-crack`: dropped `Vacuum Table, Vision Inspection, M/Z Unloading`.
- `lcd-panel` / Edge Grinder Inspection System: dropped `Accuracy : 3um`, `Inspection Item`, `Measure Grinding value on the upper and lower side of Pad`, `Measure Grinding value on the lower side of Non Pad`, `Measure the upper and lower side of Grinding simultaneously`, `Measure Grinding value on the upper and edge part of Non Pad`.
- `led-external-appearance`: dropped `Composition : M/Z Loading, Transfer Rail, Vision Inspection, Laser Marking, M/Z Unloading`.
- `mold` / Mold Inspection System: dropped `Inspection Item`, `Pin-Hole, Incomplete, S/C, Exposure, FM, etc.`, `Composition : M/Z Loading, Transfer Rail, Vision Inspection, M/Z Unloading`.
- `mold` / Mold Side Thickness & Surface Inspection System: dropped `Vision Inspection, Tray Unloading`.
- `package-inspection`: dropped `Ball Land : Cu Exposure, Scratch, Contamination, Foreign Material, Sub Broken/Pressed` and `Composition : M/Z Loading, Transfer Rail, Top Vision Inspection, Btm Vision Inspection, M/Z Unloading`.
- `panel-film-defect`: dropped `Inspection Item`, `FM > 30um, Scratch width > 30um, Bubble > 30um, Dig > 30um`, `Composition : Loading Conveyor, Film Cleaning, Film Drying, Vision Inspection,`, `Ink Marking, Sorting, Unloading Conveyor`.
- `w-b-d-a` / W/B, D/A AVI System: dropped `Wire connecting status, Stitch, Ball Attachment Status`, `Composition : Magazine Loading/Unloading, Buffer Rail, Gripper PnP,`, `Vibration free super precision state, Porous Chuck Table,3D Vision Inspection`.
- `w-b-d-a` / W/B, D/A 3D AVI System: dropped `2D D/A : Chip crack, Die position(No die, Die O/T),Pad Abnormal(Probe Mark), Film Shift`, `Common, Sub Defect, Die Scratch`, `3D : Loop & Edge Height, Sub Height, Die Height`, `Composition : Magazine Loading/Unloading, Buffer Rail, Gripper PnP,`, `Dual Vibration free super precision state, Porous Chuck Table,`, `2D Vision Inspection, 3D Vision Inspection`.
- `w-b-d-a` / W/B, D/A – 3D Optical Inspection System: dropped `Composition : Magazine Loading/Unloading, Buffer Rail, Gripper PnP,` and `Vibration free super precision state, Porous Chuck Table, 3D Vision Inspection`.

### PRODUCTS browser/home additional display truncation
- Even when extracted into `siteContent.js`, the full Products page displays only 5 bullets per equipment and the home compact rail only 2. Examples hidden from the browser include `Accuracy : 6um` and `Composition : Stand-alone type to place A/P on the coordinate measuring equipment` on `damaged-pixel`; `Burr/Crack/Bubble` on `glass-surface`; `Inspection Item` and `Burr : 50um / Dross : 50um` on `secondary-cell-battery`; `Welding width, Lead width, Cell Insertion` on `secondary-cell-battery` bus bar.

### RND
- `rnd-performance`: `cleanBlocks(..., 8)` drops `반도체 패키지 Chromatic Confocal Wire Bonding 고속 정밀 검사 시스템 Die 미세 Crack 고속 정밀 검사 시스템` from the detail page body.
- `rnd-performance`: crawl images `assets/wp-content/uploads/2019/10/j.jpg` and `assets/wp-content/uploads/2020/03/wb.jpg` are not used by the current RND route; only hardcoded `assets.rnd` / `assets.wireBond` derivatives appear.
- `core-competencies`: `cleanBlocks(..., 8)` drops `고객 맞춤형 개발`, `고객 맞춤 기술 지원`, and the full competency paragraph beginning `20년 기술 Know-How를 축적한 HITS는 각 분야의 산업에서...`.
- `key-technology`: text is mostly preserved, but the shared RND hero image is replaced by hardcoded assets.

### PR Center and news
- `pr-center`: current `/pr` route uses the custom `PrPage`, so the legacy PR Center body is not shown. Dropped exact headline: `어디에도 없는 고객 맞춤 시스템 개발 20년 기술력에 혁신과 창의를 담아` / `고객이 원하는 어떠한 시스템도 개발합니다.`
- `pr-center`: dropped PR cards and contact/image content: `Semiconductor Module / Human Error Inspection System / Creative Leader for Automation & Vision Inspection / (+82) -2-2066-3890 / hitssales@highimage.co.kr`, `Semiconductor Device / Inline Auto Tray Packing System`, `Semiconductor Device / Inline Auto Reel Packing System`.
- `hits-news`: `cleanBlocks(..., 8)` on `/pr/hits-news` keeps only the first news item area and drops later previews including `24 / 10월 2019 / 에이치아이티에스(주)가 창사 20주년을 맞이 하였습니다.`, `에이치아이티에스(주)가 창사 21주년을 맞이 하였습니다. HITS is celebrating its 21th anniversary.`, `05 / 4월 2017 / 에이치아이티에스(주), 부천사옥 본사로 이전하였습니다.`, `27 / 10월 2014 / 반도체 패키지 2D/3D 검사기술 적용 고속 검사 시스템 개발로 장영실상을 수상`.
- News post body text is exposed via `newsItems`, but all post-specific featured images are replaced by `assets.company`.

## Crawl pages not reachable from the current menu
- `over-view` legacy page is not route-reachable as `/products/over-view`; the menu's Overview child points to custom `/products`.
- Product detail pages are route-reachable from product cards and side nav, but are not direct top-menu dropdown children: `fcbga-precision-auto-unloading-system`, `substrate-split-merge`, `assembly-tester`, `protective-band-taping`, `human-error-auto-detection`, `ir-crack`, `w-b-d-a`, `package-inspection`, `mold`, `led-external-appearance`, `panel-film-defect`, `damaged-pixel`, `glass-surface`, `lcd-panel`, `secondary-cell-battery`, `inline-tray-auto-packing-system`, `inline-reel-auto-packing-system`.
- Individual PR posts are route-reachable from the custom `/pr` news list, but not top-menu children: `5976`, `5980`, `2001`, `5983`.
- Parent placeholder pages `COMPANY`, `PRODUCTS`, and `RND` contain only labels in the crawl and are represented as menu containers, not content pages.

## Unused content images from `image-manifest.csv`

These images are referenced by crawled content but are not used by the current exposed/rendered renewal data, after treating hardcoded `/assets/highimage/*` copies with the same basename as used.

- Home slides/news: `assets/wp-content/uploads/2019/10/10573.jpg`, `assets/wp-content/uploads/2019/10/430.jpg`, `assets/wp-content/uploads/2019/10/449.jpg`, `assets/wp-content/uploads/2019/10/245.jpg`, `assets/wp-content/uploads/2020/03/20200305_111700_HDR-scaled-1.jpg`, `assets/wp-content/uploads/2019/10/800.jpg`, `assets/wp-content/uploads/2019/12/hit.jpg`, `assets/wp-content/uploads/2020/03/JANG.jpg`.
- Company hero/map/history: `assets/wp-content/uploads/2020/03/715-1024x559.jpg` on `business-field`, `ceo-greeting`, `partners`, `location`; `assets/wp-content/uploads/2020/04/LOGO2.jpg`; `assets/roughmap/imgmap/aa4feea6ce54b27f0bc1c5823553b737327aa6578a03afc1e7785117a02ee4be`; `assets/localimg/localimages/07/2018/pc/common/logo_kakaomap.png`.
- PR/news: `assets/wp-content/uploads/2016/06/20200305_111555-scaled.jpg`, `assets/wp-content/uploads/2016/06/20200305_111627_HDR-1024x768.jpg`, `assets/wp-content/uploads/2020/03/20200305_111700_HDR-scaled-1.jpg`, `assets/wp-content/uploads/2019/10/800.jpg`, `assets/wp-content/uploads/2019/12/hit.jpg`, `assets/wp-content/uploads/2020/03/JANG.jpg`, `assets/wp-content/uploads/2020/03/1135-1024x527.jpg`, `assets/wp-content/uploads/2016/06/human_error-0312_s.jpg`, `assets/wp-content/uploads/2016/06/tray_s.jpg`, `assets/wp-content/uploads/2016/06/Inline-Reel-Auto-Packing-System_s.jpg`.
- Product overview/category/hero: `assets/wp-content/uploads/2019/10/430.jpg`, `assets/wp-content/uploads/2020/03/430_1-1.jpg`, `assets/wp-content/uploads/2020/04/pkg-inspection-0312_s.jpg`, `assets/wp-content/uploads/2020/04/SMT-Precision-Auto-Loading-System.jpg`, `assets/wp-content/uploads/2020/03/Inline-Tray-Auto-Packing-System.jpg`.
- RND performance: `assets/wp-content/uploads/2019/10/j.jpg`, `assets/wp-content/uploads/2020/03/wb.jpg`.

## Must-restore priority list

1. Restore all product detail specs cut by the title + subtitle + 7 bullet cap, especially composition lines, inspection items, camera/accuracy values, and process tails for W/B, D/A, LCD Panel, Inline Tray/Reel Packing, Panel Film Defect, Mold, Package Inspection, and Human Error Auto Detection.
2. Restore the legacy Products overview taxonomy and missing product names: `Auto Bake Oven`, `Wafer Sorter`, `Wafer Edge Plasma Etching`, `Wafer Inspection`, `Inline Auto Packing System`, `Storage`.
3. Restore RND lost facts: `반도체 패키지 Chromatic Confocal Wire Bonding 고속 정밀 검사 시스템 Die 미세 Crack 고속 정밀 검사 시스템`, `고객 맞춤형 개발`, `고객 맞춤 기술 지원`, and the full Core Competencies paragraph.
4. Restore legacy PR Center cards and the full HITS NEWS index previews, including the 2019 preview text that says `창사 21주년` / `21th anniversary`.
5. Add partner company names and Business Field card labels as text/alt labels, not only image-only content.
6. Reconnect content images that communicate facts or legacy context: map/Kakao map, news featured images, RND award/performance images, PR card images, and legacy home slide/news images.
7. Decide navigation treatment for legacy `over-view`, product detail pages, and individual PR posts so architects can see whether they are top-menu items, in-page links, or intentionally secondary routes.
