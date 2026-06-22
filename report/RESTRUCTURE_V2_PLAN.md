# RESTRUCTURE V2 PLAN — FULL.md → 4-Chapter Thesis Blueprint

**Purpose.** This is a design blueprint (not the rewritten thesis) that maps every section, figure, and table of the existing single-source `FULL.md` onto the authoritative 4-chapter thesis template. It records what moves where, what gets renumbered, what is reused versus reordered versus rewritten, and which content has no source and must be flagged `[TODO]`. The rewrite that follows this plan changes prose and structure only; all results, numbers, figures, and tables remain exactly as they appear in `FULL.md`.

---

## Understanding Summary

- The deepfake / face-forgery detector (SFDCT, SFDCT-HFF) is the **primary** task and gets top billing throughout (Ch1 theory, Ch2 method, Ch4 main results).
- **Liveness is the secondary / downstream task.** Its theory sits under Ch1 §1.4 "Downstream Tasks", its method under Ch2 §2.4 "Downstream Processing and Classification", its results under Ch4 §4.2.2 "Downstream Task Results". It is never framed as co-equal with deepfake.
- The template is 4 chapters (Theoretical Background; Proposed Methodology; System Analysis and Design; Implementation and Results). `FULL.md` is the old 3-chapter structure plus web-first ordering — content is relocated, not regenerated.
- `FULL.md` is the **only** source. No sibling report files are consulted.

## Assumptions

1. **Rewrite = prose/structure only.** Substance (every result, number, figure, table) is fixed by `FULL.md` and is preserved verbatim.
2. **No fabrication.** Any heading the template requires that has no `FULL.md` source is marked `gap-todo` and left as a flagged placeholder, never invented.
3. **Database Design (Ch3 §3.4) is a `[TODO]` placeholder.** `FULL.md` has no schema, ER diagram, or table definitions. Entities are only implied by actor/use-case prose; column-level design must come from real `deepguard_db` code later, not from this plan.
4. **Output** is an English Markdown thesis v2 (`.md`), following the anti-AI writing rules (bold ≤1/paragraph, no "Takeaway", no rhetorical questions, jargon glossed inline on first use).
5. The honesty disclaimers (single-seed, CIs contain zero, not state of the art) survive verbatim into the Abstract, Ch4, and Conclusion.

---

## Decision Log

| Decision | Alternatives considered | Why |
|---|---|---|
| Split old 3-chapter `FULL.md` into the 4-chapter template (Theory / Method / Analysis&Design / Impl&Results) | Keep 3 chapters; bolt on a 4th | Template is authoritative; cleanly separates system analysis/design (old Ch2) from implementation/results (old Ch3); avoids one over-stuffed results chapter. |
| Reorder Ch1 so AI theory leads and web/cloud tech moves to the end (§1.5) | Keep `FULL.md` web-first ordering | A thesis on a deepfake detector must open with the AI/domain problem; web stack is supporting infrastructure, so it belongs last. |
| Treat liveness as downstream/secondary across all chapters (Ch1 §1.4, Ch2 §2.4, Ch4 §4.2.2) | Give liveness its own co-equal chapter/track | Integrity rules + thesis scope: deepfake is the main contribution; liveness is a reused pre-filter measured on one dataset. |
| Mark Database Design (§3.4) as `gap-todo` placeholder | Reverse-engineer a schema from actor/UC prose | `FULL.md` has no schema; inventing one would be fabrication. Real schema must come from backend code later. |
| Source exclusively from `FULL.md`; renumber captions per target chapter | Pull missing pieces from sibling report files | Single-source integrity; prevents number drift and untraceable claims. Caption renumbering is mechanical. |
| Restore Table 3.5 / 3.6 and fix dangling "Table 1.6" cross-ref | Leave source numbering bugs as-is | Body contains 3.5/3.6 though the List of Tables omits them; "Table 1.6" cross-refs point to the real Table 1.4. Reconcile, do not invent. |

---

## Target Outline (v2)

**FRONT MATTER**
- Cover (Primary)
- Secondary Cover
- Supervisor's Comments
- Reviewer's Comments
- Abstract
- Graduation Project Requirements
- Acknowledgements
- Declaration of Originality
- Table of Contents *(regenerate)*
- List of Figures *(regenerate)*
- List of Tables *(regenerate)*
- List of Acronyms

**INTRODUCTION**
- Background and Motivation
- Problem Statement → Input · Output · Main Tasks
- Project Objectives
- Research Scope
- Research Methodology

**CHAPTER 1 — THEORETICAL BACKGROUND**
- 1.1 Overview of the Problem Domain
  - 1.1.1 Data Characteristics
  - 1.1.2 Problem Definition
  - 1.1.3 Benchmark Datasets
- 1.2 Fundamental Deep Learning Techniques
  - 1.2.1 Convolutional Neural Networks *(gap-todo: bridging passage)*
  - 1.2.2 Backbone Architectures
  - 1.2.3 Model-Specific Components
- 1.3 Training and Evaluation Strategies
  - 1.3.1 Loss Functions *(thin)*
  - 1.3.2 Evaluation Metrics *(thin)*
- 1.4 Downstream Tasks
  - 1.4.1 Frequency Domain Analysis
  - 1.4.2 Liveness Detection *(gap-todo: short subordinate write-up)*
- 1.5 Web Technologies for the System
  - 1.5.1 Backend Technologies
  - 1.5.2 Frontend Technologies
  - 1.5.3 Development Tools *(gap-todo: DNS-only; no IDE/Docker/Git content)*

**CHAPTER 2 — PROPOSED METHODOLOGY**
- 2.1 Overview of the Proposed AI Pipeline
- 2.2 Dataset and Preprocessing
  - 2.2.1 Dataset Structure
  - 2.2.2 Class Definition
  - 2.2.3 Preprocessing Pipeline
  - 2.2.4 Data Augmentation
  - 2.2.5 Dataset Splitting
- 2.3 Proposed Model (SFDCT)
  - 2.3.1 Motivation for Improvement
  - 2.3.2 Overall Architecture
  - 2.3.3 Description of Individual Modules
  - 2.3.4 Output Layer
- 2.4 Downstream Processing and Classification (Liveness Detection)
  - 2.4.1 Feature Extraction (Backbone and Frequency Branch)
  - 2.4.2 Data Preprocessing (Liveness)
  - 2.4.3 Feature Selection / Filtering (Cascade Pre-filter Role)
  - 2.4.4 Result Classification (Loss and Operating Point)

**CHAPTER 3 — SYSTEM ANALYSIS AND DESIGN**
- (intro: two-layer auth, multi-tenant platform)
- 3.1 Use Case Diagram
- 3.2 Use Case Specifications
  - 3.2.1 Detect Deepfake on an Image (UC-01)
  - 3.2.2 Detect Deepfake on a Video (UC-02)
  - 3.2.3 Liveness Check (UC-03)
  - 3.2.4 Supporting Use Cases (Register, Approve Tenant, API Keys, Team, Review)
  - 3.2.5 API Specifications
- 3.3 Sequence Diagrams (incl. activity diagrams as flow companions)
- 3.4 Database Design *(gap-todo: placeholder, no source)*

**CHAPTER 4 — IMPLEMENTATION AND RESULTS**
- 4.1 Training Environment and Hyperparameters
- 4.2 Experimental Results
  - 4.2.1 Main Model Results (Deepfake Detection)
  - 4.2.2 Downstream Task Results (Liveness Detection)
- 4.3 System Deployment
- 4.4 Application User Interface

**CONCLUSION**
- Achieved Results
- Limitations
- Development Directions

**REFERENCES** (31 entries, [1]–[31], verbatim)

---

## Mapping Tables

### Front Matter + Introduction

| New heading | Source in FULL.md | Status | Figures/Tables moved | Notes |
|---|---|---|---|---|
| Cover (Primary) | §Cover, l.1-12 | reuse | — | Title, supervisor, student, ID 102220041, 22T_KHDL, Da Nang 07/2026. |
| Secondary Cover | §Secondary Cover, l.13-25 | reuse | — | Identical inner title page. |
| Supervisor's Comments | §Graduation Project Comment + Instructor's Comments, l.27-92 | reuse | — | Scored rubric (2/4/2/1 pts) + blank dotted page. |
| Reviewer's Comments | §Reviewer's Comments, l.93-97 | reuse | — | Blank dotted page; keep verbatim. |
| Abstract | §Summary, l.99-112 | reuse | — | Preserve not-SOTA / CI-contains-zero honesty verbatim. |
| Graduation Project Requirements | §Graduation Project Requirements, l.113-171 | reuse | — | Embedded outline (l.143-153) is OLD 3-chapter; signed form — flag to supervisor. |
| Acknowledgements | §Preface, l.173-191 | reuse | — | — |
| Declaration of Originality | §Assurrance, l.193-209 | reuse | — | (sic spelling in source). |
| Table of Contents | §Table of Content, l.211-296 | rewrite | — | Fully regenerate for 4-chapter template; new page numbers. |
| List of Tables | §List of Tables, l.298-304 | adapt | all tables | Regenerate after chapter renumber; restore Table 3.5/3.6. |
| List of Figures | §List of Figures, l.306-316 | adapt | all figures | Regenerate; cross-check `fig_3_x` filenames vs caption order. |
| List of Acronyms | §List of Symbol, Acronym, l.318-371 | reuse | 41-row table | Keep all 41 entries; verify against final used acronyms. |
| Intro — Background and Motivation | §Intro 1, l.378-384 | reorder | — | eKYC, two threats, generalisation gap, Circular 17/2024/TT-NHNN. |
| Intro — Problem Statement | §Intro 1 (l.382) + 2 (l.388-394) | rewrite | — | Synthesise Input/Output/Main-Tasks subsections from existing prose. |
| — Input | §Intro 1 l.382 + 3 l.398/406 | adapt | — | Frame-level single face image, no temporal info. |
| — Output | §Intro 1 l.382 + 3 l.400-402 | adapt | — | Real/fake risk score + heat map; live/spoof verdict. |
| — Main Tasks | §Intro 3 l.398-404 | adapt | — | Four bullets; liveness framed as secondary. |
| Intro — Project Objectives | §Intro 2 (l.388-394) + 3 (l.396-404) | reorder | — | Aim/rationale here; concrete task list under Problem Statement. |
| Intro — Research Scope | §Intro 2 l.394 + 3 l.406 | adapt | — | Frame-level only, no temporal; DeepfakeBench protocol. |
| Intro — Research Methodology | §Intro 4, l.408-440 | reorder | — | Seven-step process reshaped to methodology framing. |

### Chapter 1 — Theoretical Background

| New heading | Source in FULL.md | Status | Figures/Tables moved | Notes |
|---|---|---|---|---|
| 1.1 Overview of the Problem Domain | §1.8 + §1.9 umbrella, l.713-805; Intro l.107-111,380-382 | reorder | — | Parent for 1.1.1-1.1.3. |
| 1.1.1 Data Characteristics | §1.8.1/1.8.2/1.8.4, l.715-761 | reorder | — | Three forgery families; spatial vs frequency traces. |
| 1.1.2 Problem Definition | §1.9.1/1.9.2, l.765-783 | reorder | — | Binary classification + generalisation gap. Two omitted formula images move with text. |
| 1.1.3 Benchmark Datasets | §1.9.3, l.785-804 | reorder | T1.4→1.4, T1.5→1.5 | FF++ (train) + Celeb-DF-v2 (test); DeepfakeBench. |
| 1.2 Fundamental DL Techniques | (umbrella) | adapt | — | New heading; substance from children. |
| 1.2.1 Convolutional Neural Networks | §1.5.3 convolution facts only | gap-todo | — | Write brief CNN-basics from existing facts; no new numbers. |
| 1.2.2 Backbone Architectures | §1.5 (1.5.1/1.5.2/1.5.4) | reorder | T1.1→1.1 | EfficientNet-B4, compound scaling, transfer learning. |
| 1.2.3 Model-Specific Components | §1.5.3 MBConv/SE + §1.7 attention | reorder | Fig1.2→1.1; T1.3→1.4 | Gate value cross-ref: Ch3→Ch4. |
| 1.3 Training and Evaluation Strategies | embedded in §1.9.1 | adapt | — | New umbrella; thin source. |
| 1.3.1 Loss Functions | §1.9.1 l.771-773 | gap-todo | — | BCE only; expand minimally, no new variants. |
| 1.3.2 Evaluation Metrics | §1.9.1 l.777 | gap-todo | — | AUC only; ACER/APCER belong to liveness (Ch2.4), not here. |
| 1.4 Downstream Tasks | (umbrella) | adapt | — | New heading. |
| 1.4.1 Frequency Domain Analysis | §1.6, l.617-673 | reorder | Fig1.3→1.2; T1.2→1.5 | DCT theory; two omitted formula images move. Update "Section 1.9" cross-ref→1.1.1. |
| 1.4.2 Liveness Detection | conclusion l.828 + Intro + §2.1.1 | gap-todo | — | Short subordinate write-up; do not invent FAS literature. |
| 1.5 Web Technologies for the System | §1.1-1.4 + §1.10 | reorder | — | Relocated to chapter end. |
| 1.5.1 Backend Technologies | §1.2, §1.3, §1.10 | reorder | Fig1.1→1.3 | FastAPI, REST, AWS; Fig 1.1 is omitted placeholder — keep, do not fabricate. |
| 1.5.2 Frontend Technologies | preamble + §1.1 | reorder | — | JS/TS, Next.js. Drop stray l.460 artifact. |
| 1.5.3 Development Tools | §1.4 DNS only | gap-todo | — | Only DNS fits; retitle or flag missing dev-tools. |

### Chapter 2 — Proposed Methodology

| New heading | Source in FULL.md | Status | Figures/Tables moved | Notes |
|---|---|---|---|---|
| 2.1 Overview of the Proposed AI Pipeline | §2.3 intro + §2.5 + §2.4.4 | adapt | — | Prose only; no pipeline diagram exists (gap-todo if template needs one). |
| 2.2 Dataset and Preprocessing | §2.3.1 + §3.1.1 | reorder | — | Deepfake (main) dataset. |
| 2.2.1 Dataset Structure | §2.3.1 + §3.1.1 | reuse | T2.9→2.1, T3.4→2.2 | Leave Table 1.5 in Ch1 to avoid double-count. |
| 2.2.2 Class Definition | §3.1.1 + §1.9.1 | reuse | Fig3.1→2.1 | Loss formula stays in Ch1 §1.3.1. |
| 2.2.3 Preprocessing Pipeline | §2.3.1 + §3.1.1 | reuse | Fig3.2→2.2; T2.10→2.3 | 256px; 8×8 DCT grid alignment. Fig 3.3 stays in Ch4. |
| 2.2.4 Data Augmentation | §2.3.1 l.1155-1157 | reuse | — | Train-only; cautious spectral aug. |
| 2.2.5 Dataset Splitting | §2.3.1 l.1151-1161 | adapt | — | 32 frames/video; cross-dataset = generalisation measure. No invented ratios. |
| 2.3 Proposed Model (SFDCT) | §2.5 + §3.1.3 | adapt | — | Intro to SFDCT + SFDCT-HFF variant. |
| 2.3.1 Motivation for Improvement | §1.5.1/§1.7.1/§1.9.2/§1.6.1 | rewrite | — | Synthesise from Ch1 theory; substance fixed. |
| 2.3.2 Overall Architecture | §3.1.3 + §1.5.1 + §2.5 | adapt | Fig3.6→2.3 | Zero-start gate floor property. No clean block diagram exists (gap). |
| 2.3.3 Description of Individual Modules | §1.5 + §1.6 + §1.7 + §3.1.4 | reuse | Fig1.2→2.4, Fig1.3→2.5, Fig3.8→2.6; T1.1→2.4, T1.2→2.5, T1.3→2.6, T2.11→2.7 | Four modules; cite Ch1 for generic background. |
| 2.3.4 Output Layer | §1.9.1 + §3.1.2 + §1.7.3 | adapt | — | Two-class head, BCE, AUC. Threshold numbers (T3.7) go to Ch4. |
| 2.4 Downstream Processing (Liveness) | §2.4 intro, l.1181-1183 | adapt | — | Secondary module; honest negative. |
| 2.4.1 Feature Extraction | §2.4.3 + §2.4.4 | adapt | Fig2.6→2.7, Fig2.7→2.8 | Baseline B4 vs B4+DCT proposal. |
| 2.4.2 Data Preprocessing (Liveness) | §2.4.1, l.1185-1218 | reuse | T2.12→2.8, T2.13→2.9 | LCC-FASD primary, NUAA smoke. Table 3.9 split stays in Ch4. |
| 2.4.3 Feature Selection / Filtering | §2.4.4 + §1.6.3 | adapt | — | Band dropping + cascade pre-filter role. |
| 2.4.4 Result Classification | §2.4.2, l.1220-1252 | reuse | — | BCE, APCER/BPCER/ACER, EER threshold. Measured numbers (T3.10) go to Ch4. |

### Chapter 3 — System Analysis and Design

| New heading | Source in FULL.md | Status | Figures/Tables moved | Notes |
|---|---|---|---|---|
| Ch3 intro | §2.2.1 l.916-918 + §2.5 l.1300 | adapt | — | Two-layer auth; multi-tenant. Requirement analysis (§2.1) not in template. |
| 3.1 Use Case Diagram | §2.2.1, l.916-943 | reuse | Fig2.1→3.1; T2.1→3.1 | Six actors. Fig 2.1 is omitted placeholder — asset must be regenerated. |
| 3.2 Use Case Specifications | §2.2.2, l.945-1023 | reuse | — | Template's 7 named UCs vs DeepGuard taxonomy — see gaps. |
| 3.2.1 UC-01 Image | §2.2.2 T2.2, l.947-962 | reuse | T2.2→3.2 | Exists fully. |
| 3.2.2 UC-02 Video | §2.2.2 T2.3, l.964-985 | reuse | T2.3→3.3 | Async job for long videos. |
| 3.2.3 UC-03 Liveness | §2.2.2 T2.4, l.987-1008 | reuse | T2.4→3.4 | Downstream task UC legitimately lives here. |
| 3.2.4 Supporting Use Cases | §2.2.2 T2.5 l.1010-1021 + l.1108 | adapt | T2.5→3.5 | Light-fill Login/History/User-Mgmt from summary + requirement prose. |
| 3.2.5 API Specifications | §2.2.5, l.1067-1108 | reuse | T2.6→3.6, T2.7→3.7, T2.8→3.8 | JSON examples are illustrative — preserve verbatim, not measured results. |
| 3.3 Sequence Diagrams | §2.2.4 l.1045-1065 + §2.2.3 l.1025-1043 | reuse | Fig2.4→3.2, Fig2.5→3.3, Fig2.2→3.4, Fig2.3→3.5 | Activity diagrams folded in. All four are omitted placeholders. |
| 3.4 Database Design | NONE | **gap-todo** | — | Placeholder; do NOT invent schema. |

### Chapter 4 — Implementation and Results

| New heading | Source in FULL.md | Status | Figures/Tables moved | Notes |
|---|---|---|---|---|
| 4.1 Training Environment and Hyperparameters | §3.1.1, l.1310-1416 | reuse | T3.1→4.1, T3.2→4.2, T3.3→4.3, T3.4→4.4; Fig3.1→4.1 | Two-phase setup; shared recipe; class-dist justifies frame-level AUC. |
| 4.2 Experimental Results | §3.1 intro l.1306-1308 | reorder | — | Parent; deepfake first, liveness second. |
| 4.2.1 Main Model Results (Deepfake) | §3.1.2-§3.1.8, l.1418-1629 | reuse | T3.5→4.5…T3.8→4.8; Fig3.4→4.4…Fig3.16→4.16 | Includes calibration, discussion, conclusion. Verify deleted `fig_3_5_train_row1.png`. |
| 4.2.2 Downstream Task Results (Liveness) | §3.1.9, l.1631-1752 | reuse | T3.9→4.9, T3.10→4.10; Fig3.17→4.17, Fig3.18→4.18, Fig3.19→4.19 | Keep measured numbers; method defs in Ch2.4. |
| 4.3 System Deployment | §3.2, l.1756-1843 | reuse | T3.11→4.11, T3.12→4.12; Fig3.20→4.20 | Concrete stack-as-deployed; theory stays in Ch1.5. |
| 4.4 Application User Interface | §3.3, l.1845-1885 | reuse | Fig3.21→4.21, Fig3.22→4.22, Fig3.23→4.23 | §3.4 recap (l.1887-1889) feeds Conclusion, not a 4.x subsection. |

### Conclusion + References

| New heading | Source in FULL.md | Status | Notes |
|---|---|---|---|
| Conclusion — Achieved Results | §Conclusion intro + Key achievements, l.1893-1907 | reuse | Keep honesty caveat verbatim; strip interleaved running header l.1911. |
| Conclusion — Limitations | §Conclusion Limitations, l.1909-1925 | reuse | Strip running header l.1911. |
| Conclusion — Development Directions | §Conclusion Future directions, l.1927-1939 | reuse | Drop trailing header l.1941. |
| References | §References, l.1943-2009 | reuse | 31 entries [1]-[31] verbatim. Strip headers l.1969/2001. l.2011+ is template furniture, not references. |

---

## Figure Renumber Map (old → new)

| Old (FULL.md) | New (target) | Chapter change |
|---|---|---|
| Fig 1.1 Rest API Architecture | Fig 1.3 (§1.5.1) | — |
| Fig 1.2 MBConv block | Fig 1.1 (§1.2.3) + reused as Fig 2.4 (§2.3.3) | — |
| Fig 1.3 Zigzag scan / 16 bands | Fig 1.2 (§1.4.1) + reused as Fig 2.5 (§2.3.3) | — |
| Fig 2.1 Overview use case diagram | Fig 3.1 (§3.1) | 2→3 |
| Fig 2.2 Activity: image detection | Fig 3.4 (§3.3) | 2→3 |
| Fig 2.3 Activity: eKYC cascade | Fig 3.5 (§3.3) | 2→3 |
| Fig 2.4 Deepfake detection sequence | Fig 3.2 (§3.3) | 2→3 |
| Fig 2.5 eKYC cascade sequence | Fig 3.3 (§3.3) | 2→3 |
| Fig 2.6 B4-liveness baseline arch | Fig 2.7 (§2.4.1) | — |
| Fig 2.7 B4+DCT-liveness proposal arch | Fig 2.8 (§2.4.1) | — |
| Fig 3.1 Real/fake count distribution | Fig 4.1 (§4.1) + reused as Fig 2.1 (§2.2.2) | 3→4 |
| Fig 3.2 Real/fake pair + spectrum | Fig 4.2 (§4.1) or Fig 2.2 (§2.2.3) | 3→4 / →2 |
| Fig 3.3 Mean freq energy by band | Fig 4.3 (§4.1, results-adjacent) | 3→4 |
| Fig 3.4 Baseline model summary | Fig 4.4 (§4.2.1) | 3→4 |
| Fig 3.5 Baseline training curve | Fig 4.5 (§4.2.1) | 3→4 **[asset DELETED — verify]** |
| Fig 3.6 SFDCT model summary | Fig 4.6 (§4.2.1) + reused Fig 2.3 (§2.3.2) | 3→4 |
| Fig 3.7 SFDCT training curve | Fig 4.7 (§4.2.1) | 3→4 |
| Fig 3.8 SFDCT-HFF full model summary | Fig 4.8 (§4.2.1) + reused Fig 2.6 (§2.3.3) | 3→4 |
| Fig 3.9 SFDCT-HFF training curve | Fig 4.9 (§4.2.1) | 3→4 |
| Fig 3.10 ROC curves (5% FPR line) | Fig 4.10 (§4.2.1) | 3→4 |
| Fig 3.11 Precision-recall curves | Fig 4.11 (§4.2.1) | 3→4 |
| Fig 3.12 Confusion matrix @ eKYC threshold | Fig 4.12 (§4.2.1) | 3→4 |
| Fig 3.13 2D t-SNE projection | Fig 4.13 (§4.2.1) | 3→4 |
| Fig 3.14 Grad-CAM heat map | Fig 4.14 (§4.2.1) | 3→4 |
| Fig 3.15 Example predictions | Fig 4.15 (§4.2.1) | 3→4 |
| Fig 3.16 Gate value distribution | Fig 4.16 (§4.2.1) | 3→4 |
| Fig 3.17 Example live/spoof faces | Fig 4.17 (§4.2.2) | 3→4 |
| Fig 3.18 B4-liveness ROC + scores | Fig 4.18 (§4.2.2) | 3→4 |
| Fig 3.19 B4+DCT-liveness ROC + scores | Fig 4.19 (§4.2.2) | 3→4 |
| Fig 3.20 Single-instance deployment | Fig 4.20 (§4.3) | 3→4 |
| Fig 3.21 Home screen | Fig 4.21 (§4.4) | 3→4 |
| Fig 3.22 Deepfake result screen | Fig 4.22 (§4.4) | 3→4 |
| Fig 3.23 Liveness screen | Fig 4.23 (§4.4) | 3→4 |

**Distinct figure assets carried: 23** (Fig 1.1–1.3, 2.6–2.7, 3.1–3.23 in FULL.md; several Ch1/Ch3 figures are additionally *reused* under new numbers in Ch2).

## Table Renumber Map (old → new)

| Old (FULL.md) | New (target) | Chapter change |
|---|---|---|
| T1.1 Compare Depth/Width/Resolution | T1.1 (§1.2.2) + reused T2.4 (§2.3.3) | — |
| T1.2 Regions of 2D DCT block | T1.5 (§1.4.1) + reused T2.5 (§2.3.3) | — |
| T1.3 Roles in cross-attention fusion | T1.4 (§1.2.3) + reused T2.6 (§2.3.3) | — |
| T1.4 Four forgery methods in FF++ | T1.4… see note (renumber within §1.1.3) | — |
| T1.5 The two datasets | T1.5 (§1.1.3) | — |
| T2.1 Actors | T3.1 (§3.1) | 2→3 |
| T2.2 UC image | T3.2 (§3.2.1) | 2→3 |
| T2.3 UC video | T3.3 (§3.2.2) | 2→3 |
| T2.4 UC liveness | T3.4 (§3.2.3) | 2→3 |
| T2.5 Supporting use cases | T3.5 (§3.2.4) | 2→3 |
| T2.6 API image | T3.6 (§3.2.5) | 2→3 |
| T2.7 API video | T3.7 (§3.2.5) | 2→3 |
| T2.8 API liveness | T3.8 (§3.2.5) | 2→3 |
| T2.9 Data sources and role | T2.1 (§2.2.1) | — |
| T2.10 Face preprocessing steps | T2.3 (§2.2.3) | — |
| T2.11 Reasons (deepfake) | T2.7 (§2.3.3) | — |
| T2.12 Liveness datasets and role | T2.8 (§2.4.2) | — |
| T2.13 Reasons (liveness) | T2.9 (§2.4.2) | — |
| T3.1 Hardware | T4.1 (§4.1) | 3→4 |
| T3.2 Software stack | T4.2 (§4.1) | 3→4 |
| T3.3 Shared hyperparameters | T4.3 (§4.1) | 3→4 |
| T3.4 Dataset statistics | T4.4 (§4.1) + reused T2.2 (§2.2.1) | 3→4 |
| T3.5 Cross-dataset frame-level | T4.5 (§4.2.1) | 3→4 **[missing from List of Tables — restore]** |
| T3.6 Video-level AUC + 95% CI + paired diffs | T4.6 (§4.2.1) | 3→4 **[missing from List of Tables — restore]** |
| T3.7 eKYC threshold calibration | T4.7 (§4.2.1) | 3→4 |
| T3.8 Comparison vs baseline + freq methods | T4.8 (§4.2.1) | 3→4 |
| T3.9 LCC-FASD official split | T4.9 (§4.2.2) | 3→4 |
| T3.10 Comparison of two liveness models | T4.10 (§4.2.2) | 3→4 |
| T3.11 Instance spec | T4.11 (§4.3) | 3→4 |
| T3.12 Demonstration accounts | T4.12 (§4.3/§4.4) | 3→4 |

**Distinct tables carried: 26** (T1.1–1.5, T2.1–2.13, T3.1–3.12 in FULL.md, with restored T3.5/T3.6; several Ch1 tables additionally *reused* under new numbers in Ch2). Note: the acronym table (41 rows) is front-matter, counted separately.

---

## Gaps / [TODO] List

1. **Ch3 §3.4 Database Design** — NO source in `FULL.md`. No schema, ER diagram, or table descriptions anywhere. Entities only implied by actor/UC prose (tenant, user+role, api_key, detection_result, liveness_check, audit_note, job, quota). **Placeholder only; do not invent.** Fill later from real `deepguard_db` backend code.
2. **Ch1 §1.2.1 Convolutional Neural Networks** — no standalone CNN-fundamentals subsection; write a brief bridging passage from existing convolution facts only.
3. **Ch1 §1.3 / §1.3.1 / §1.3.2** — no dedicated training/eval theory section; BCE and AUC stated in one line each inside §1.9.1. Thin; expand minimally, no new variants.
4. **Ch1 §1.4.2 Liveness Detection** — no dedicated Ch1 liveness theory; taxonomy/passive-active/standard-metric only in conclusion + intro. Short subordinate write-up; do not invent FAS literature.
5. **Ch1 §1.5.3 Development Tools** — only DNS fits; no IDE/Docker/Git content. Retitle to cover DNS or flag missing.
6. **Intro Input / Output / Main Tasks / Research Scope** — no dedicated headings; reshape (not invent) from Problem Statement + Objective prose.
7. **Ch2 §2.1 pipeline diagram & §2.3.2 clean architecture diagram** — no purpose-drawn diagrams in `FULL.md` (only model-summary screenshots). Prose synthesisable; a clean diagram would be new — flag, do not fabricate.
8. **Ch2 §2.2.5 split ratios** — only cross-dataset protocol + 32-frame sampling; no train/val/test % split stated. Do not invent ratios.
9. **Formula images** intentionally omitted in `FULL.md` (l.627, 637, 689, 773, 1228, 1242). Inline equations exist for some; flag missing rendered assets for re-render, do not retype unverified math.
10. **Ch3 Login / History Management / Result Visualization / User Management UC specs** — no standalone tables; only summary (T2.5) + auth sentence (l.1108) + requirement prose (l.860). Light-fill from existing prose; no fabricated flows.
11. **Ch3 Activity Diagrams** — template lists only Sequence Diagrams; fold activity diagrams (Fig 2.2/2.3) into §3.3.
12. **Source numbering bugs to reconcile (not gaps, integrity flags):** (a) body cites "Table 1.6" (l.733, 789) which does not exist — referent is Table 1.4; (b) List of Tables omits T3.5/T3.6 which appear in the body — restore both; (c) target Ch3 renumbered tables would collide with FULL Ch3 numbers — assign final numbers per target chapter.
13. **`fig_3_5_train_row1.png` shows DELETED in git status** — regenerate/relink before compile or Fig 4.5 becomes a gap.
14. **Graduation Project Requirements form** embeds OLD 3-chapter outline (l.143-153) — signed form, flag to supervisor whether to update inline outline.

---

## Numbers to Preserve Verbatim

**Deepfake — frame-level AUC**
- Baseline frame AUC **0.7497** vs published benchmark **0.7487** (diff ~0.001).
- SFDCT best **0.7572**; SFDCT-HFF minimal **0.7553**; SFDCT-HFF full **0.7695**.
- Table 3.5 mean-over-run: baseline **0.7082**, SFDCT **0.7140**, HFF-full **0.7236**; diffs vs baseline +0.0075 / minimal +0.0056 / full +0.0198.

**Deepfake — video-level AUC (bootstrap 2000 resamples, 518 test videos)**
- Baseline **0.8203** [0.781, 0.857]; SFDCT **0.8083** [0.770, 0.847], diff −0.012 [−0.044, +0.021]; HFF-min **0.8146** [0.774, 0.853], diff −0.006 [−0.038, +0.026]; HFF-full **0.8269** [0.788, 0.864], diff +0.007 [−0.022, +0.037].
- Every paired interval contains zero; no variant significant at video level.

**eKYC operating point (Table 3.7)** — threshold **0.9514**, target FPR ≤5%, measured FPR **0.0500**, catch rate **0.2298**, accuracy **0.476**, F1 **0.366**.

**Confusion at 5% FPR** — 5339 genuine accepted, 281 genuine wrongly rejected, 8318 fakes missed, 2482 fakes caught; ~77% fakes missed; ~5% genuine wrongly rejected.

**Comparison (Table 3.8)** — EfficientNet-B4 benchmark 0.7487; B4 this thesis 0.7497; phase-based freq method 0.7650; residual-based freq method 0.7552; SFDCT 0.7572; SFDCT-HFF full **0.7695** (bold).

**Low-FPR catch rates** — base detector ~23% of fakes at frame level; ~⅓ at video level; ~½ in wider review band for strongest variant; ~¼ at 5% FPR best frame-level.

**Liveness (LCC-FASD)**
- Splits — training 1223 live / 7076 spoof / 8299; development 405 / 2543 / 2948; evaluation 314 / 7266 / 7580.
- B4-liveness: AUC **0.9829**, ACER **6.85%**, attack-acceptance (APCER) **2.86%**, genuine-rejection (BPCER) **10.83%**.
- B4+DCT-liveness: AUC **0.9776**, ACER **7.54%**, attack-acceptance **4.25%**, genuine-rejection **10.83%**.
- AUC ~0.98 exceeds published light-network baselines (~0.92 AUC, ~16% ACER); freq diff ~0.005, within noise (eval split only 314 genuine images).
- Abstract phrasing: video-level AUC ~0.82 baseline, 0.81 SFDCT, 0.83 SFDCT-HFF; liveness head AUC 0.98, ACER 6.85%.

**Deployment** — served detector ~70 MB; ~1 second per image; CPU-only (no GPU); recommended instance 2 cores / 8 GB; wall-clock ~5 h baseline & base detector, ~1 h each HFF variant.

**Regulatory / honesty** — Circular 17/2024/TT-NHNN prescribes no numeric error rate (5% FPR is an engineering choice); ISO/IEC 30107-3; single-seed, not state of the art, margins inside noise band; **References total = 31** ([1]–[31]).

---

## Open Risks

- **Tension: "rewrite from scratch" vs "no fabrication."** A full prose rewrite invites the model to smooth gaps with invented detail. This plan resolves it by partitioning every section into one of four statuses — `reuse` (text largely kept), `reorder` (moved, prose lightly reshaped), `rewrite` (prose regenerated, **substance pinned** to the "must_preserve" list and the "Numbers to Preserve Verbatim" section above), and `gap-todo` (placeholder, explicitly not written). The rewriter may only restyle prose; every result, figure, and table is locked by the inventory and number list, so no rewrite step can introduce an unsourced claim.
- **Caption/number drift** when chapters renumber (esp. Ch3 collisions with old Ch3, and the restored Table 3.5/3.6). Mitigation: final numbers assigned per target chapter using the renumber maps; List of Figures/Tables regenerated last, after all chapter renumbering.
- **Missing assets** (omitted formula images; deleted `fig_3_5_train_row1.png`; omitted diagram placeholders). Mitigation: flagged in the Gaps list for re-render/relink before compile; no math retyped from memory.
- **Database Design and other gap-todo sections** could be silently filled to "complete" the template. Mitigation: they are explicitly marked placeholders and must remain so until sourced from real code (DB) or written from existing facts only (CNN basics, liveness theory) with supervisor sign-off.
