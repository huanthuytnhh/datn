# SKELETON — THESIS_REPORT_EN restructured to MATCH Trần Đức Trí's TOC

This is the controlling contract for all chapter-writer agents. Goal: reorder/restructure
the existing English thesis (deepfake + liveness, SFDCT method) so its **table of contents
and section sequence mirror Trần Đức Trí's tonic-chord/vocal-separation thesis EXACTLY**,
mapping each of Trí's audio-domain sections onto our deepfake/liveness domain.

Trí's full thesis (style + depth reference): `/tmp/tri.md` (6909 lines; agents may grep/read
specific ranges for prose cadence). Trí's exact TOC is at `/tmp/tri.md` lines ~707–842.

## SOURCE CONTENT (reuse & reorganize — DO NOT fabricate, DO NOT rewrite from scratch)
All under `report/_en_parts/`:
- `00_frontmatter.md` — title page, remarks, abstract, assignment, ack, declaration, TOC/lists/abbrev.
- `01_introduction.md` — Problem statement · Objectives & RQ · Object & scope · Methodology · Significance · Report structure.
- `02_chapter1.md` — Ch1 theories (deepfake overview, detection problem, datasets, B4, DCT, attention, S1–S5 foundations, eKYC, app tech, summary).
- `03_chapter2.md` — Ch2 (requirements, design, use-cases, flows, API, data pipeline, SFDCT architecture, 5 levers/4 ablations, loss/training, metrics/XAI, justification).
- `04_chapter3.md` — Ch3 (environment, data stats, training/convergence, main ablation, qualitative viz, eKYC demo, implementation, discussion).
- `05_conclusion_refs.md` — Conclusion + References.
- `aug_usecases.md` (2.2.4 use-case specs) · `aug_flows.md` (2.2.5 activity + 2.2.6 sequence) · `aug_apispec.md` (2.2.7 API specs, incl. liveness) · `aug_deploy.md` (implementation/deploy) · `aug_ch1_techstack.md` (1.9 app technologies).
- Liveness raw material: `report/LIVENESS_RESEARCH.md`, `report/LIVENESS_BENCHMARK_PAPERS.md`.
- Figures: `report/figures/` — see `report/FIGURE_MANIFEST.md`. Reference with relative `figures/<name>.png`.

## CANONICAL NUMBERS (own-run; FF++ c23 train → cross-dataset CDFv2). Use VERBATIM. Never invent.
- EfficientNet-B4 baseline: CDFv2 frame-AUC = **0.7497** (DeepfakeBench-harmonized variant = 0.7487; use 0.7497 as own-run primary).
- naive SFDCT: CDFv2 frame-AUC = **0.7572** (Δ **+0.0075** over B4 — *within noise*, state this).
- Row1 (lever variant): CDFv2 AUC = **0.7333** (Δ **−0.0164** — BELOW baseline; honest negative result).
- Row2: **[[FILL — training]]**.
- video-level AUC at best ckpt (bootstrap CI95, 518 videos, n=2000, seed 42): B4 **0.8203** [0.781,0.857] · naive **0.8083** [0.770,0.847] · Row1 **0.7869** · Fix1 **0.8121** · Fix2 **0.8137** · HFF-R1 **0.8146** · HFF-R3 **0.8269** [0.788,0.864]. **All paired Δ vs B4 contain zero.**
- Multi-protocol frame-AUC (top3avg/last/mean±std/best — Table 3.5b): B4 0.7434/0.7063/0.7082±0.0219/0.7497 · naive 0.7507/0.7123/0.7140±0.0253/0.7572 · Row1 0.7315/0.7046/0.7054±0.0188/0.7332 · Fix1 0.7474/0.6775/0.7099±0.0250/0.7523 · Fix2 0.7494/0.6860/0.7149±0.0240/0.7523 · HFF-R1 best-only 0.7553 · HFF-R3 0.7410†/0.7335†/0.7236±0.0183†/0.7695 († epoch-end console capture). **Ranking naive>B4>Row1 holds under all four protocols.** Source: `report/evidence/ablation_cdfv2/` + `report_prepare/mt10_ablation_full.py`.
- Liveness (LCC-FASD official split, measured+verified): B4 **AUC 0.9829/ACER 0.0685**, B4+DCT **0.9776/0.0754**, τ=0.8743 @dev-EER. Evidence: `report/evidence/liveness_lcc_verification.md`.
- eKYC operating point (naive SFDCT): τ = **0.9514**, FPR = **0.0500**, TPR = **0.2298**, ACC **0.476**, F1 **0.366**.
- Confusion @ τ: TN **5339**, FP **281**, FN **8318**, TP **2482**.
- Frame counts: FF++ ≈ **159,626**; CDFv2 test **16,420** (5,620 real + 10,800 fake).
- Hyperparameters: **10 epochs**, Adam **lr 2e-4**, **wd 5e-4**, no scheduler, **seed 1024**, **batch 32**, base loss cross-entropy; naive extra loss weights λ_cons=**1.0**, λ_sc=**0.3**, margin m=**0.3**.
- Serving runtime (verified live): device **CUDA**, ckpt **ckpt_best.pth**, model_version **naive-sfdct-cdfv2-0.7572**, microservice `uvicorn serving.infer_server:app` :8501 (`/health`, `/predict` → prob_fake + Grad-CAM base64).

## HONESTY CONSTRAINTS (NON-NEGOTIABLE — a violation = the section fails review)
1. **NO SOTA claim.** SPSL (0.7650) still beats SFDCT (0.7572). State this explicitly where results are compared.
2. **TT17/2024/TT-NHNN is QUALITATIVE**: it requires biometric verification but does **NOT** mandate FPR≤5%. The 5% operating point is **OUR** choice per **ISO/IEC 30107-3**. NEVER write "TT17 mandates/requires 5%". Phrase: "we adopt FPR≤5% per ISO/IEC 30107-3 to satisfy TT17's qualitative biometric-verification requirement".
3. **SFDCT = EfficientNet-B4 (spatial) + 8×8 block-DCT branch + zero-init gated cross-attention fusion.** Gate α initialised to **0** (floor ≥ B4 backbone). NO global-differential / SIDA branch. Distinguish from SFCL-HCMF (its gate inits at 0.5) when contrasting.
4. **Liveness = SECONDARY, MEASURED module (updated 2026-06-10).** B4 vs B4+DCT trained on **LCC-FASD** official split; **MEASURED + VERIFIED**: B4 **AUC 0.9829 / APCER 0.0286 / BPCER 0.1083 / ACER 0.0685**, B4+DCT **AUC 0.9776 / ACER 0.0754** (Δ −0.0053 within noise, 314 bona-fide eval images — say "does not improve", never "hurts"). Threshold τ=0.8743 @dev-EER. Verification: official-split asserted, counts match, MD5 audit found 48 train∩eval + 25 dev∩eval duplicates **in the official release** — removing them gives AUC 0.9858 (no inflation); script `liveness/verify_liveness_eval.py`, evidence `report/evidence/liveness_lcc_verification.md`. CAVEATS to state: within-dataset only; cascade wiring outstanding. Metrics: binary CE + **APCER/BPCER/ACER** (ISO/IEC 30107-3).
5. **Vietnamese deepfake set = test-only, PLANNED (G2)** — mark **[[FILL]]**.
6. Mark **[[FILL]]** / TODO (never fabricate): Row2 everywhere, per-lever S1–S5 ablation table, FF++ in-dataset AUC column, DFDC, demo-infer images (Fig 3.14/3.15), app screenshots (Ch3 §3.3), training time (rented GPU), rented-GPU hardware specs, hand-drawn architecture diagrams (Fig 1.x/2.x), Chapter-2 method subsection for block-DCT-HFF. ~~bootstrap video-level CI~~ → DONE 2026-06-10 (CDFv2 best-ckpt, Table 3.5c; FF++ CI still pending).
7. **CREDIT explicitly**: built on **DeepfakeBench**; adapted papers **SPSL, SRM, FreqDebias, FcaNet, FDFL**; backbone **EfficientNet**. Keep these in References + inline.
8. Citations to verify → mark **[[VERIFY]]**.
9. Language: **English**. Match Trí's register: explanatory, didactic, formula-then-intuition, figure-anchored, each subsection ends with a one-line takeaway. Each chapter ends with a "Conclusion" / "Chapter summary".

## TARGET TOC (the new structure — every writer must produce EXACTLY these section numbers/titles)

### FRONT MATTER  → file `report/_en_v2/00_frontmatter.md`
Reuse `00_frontmatter.md` verbatim; only REPLACE the "TABLE OF CONTENTS" body to mirror the new structure below.

### INTRODUCTION  → file `report/_en_v2/01_introduction.md`
Relabel existing intro to Trí's front items, same order:
1. Problem Statement  2. Purposes  3. Objectives  4. Implementation process  5. Structure of the thesis
(Map: existing "Significance"→Purposes; "Methodology"→Implementation process; keep Problem statement & Objectives; fold "Object & scope" into Objectives.)

### CHAPTER 1: THEORIES AND TECHNOLOGIES  → file `report/_en_v2/02_chapter1.md`
NEW ORDER (web-tech first, then AI theory, then domain, then cloud — exactly Trí):
- 1.1 JavaScript  *(NEW — short; from general knowledge + aug_ch1_techstack context)*
- 1.2 Next.js — Key Features · Advantages  *(from aug_ch1_techstack 1.9.1)*
- 1.3 FastAPI  *(from aug_ch1_techstack 1.9.2)*
- 1.4 HTTP API — Structure · Request · Response · Benefits  *(from aug_ch1_techstack 1.9.5; expand to Trí's 4 sub-bullets)*
- 1.5 DNS — DNS Servers  *(NEW — short; pairs with AWS/domain)*
- 1.6 EfficientNet-B4  *(from existing 1.4: compound scaling, MBConv, why B4, transfer learning)*
- 1.7 DCT & Frequency Analysis  *(from existing 1.5: 1D/2D DCT, block-8×8/JPEG, zigzag/16 bands, log-mag, YCbCr; FOLD the S1–S5 frequency-technique foundations here as a "1.7.x inherited frequency cues (SPSL/SRM/FcaNet/FreqDebias/FDFL)" subsection so no orphan section remains)*
- 1.8 Attention & Fusion  *(from existing 1.6: self/cross-attention, gated fusion, zero-init floor)*
- 1.9 Overview of Deepfake Technology  *(from existing 1.1: generation families, FF++ 4 families, spatial-weak/frequency-loud traces)*  ← maps Trí "Digital Audio Signal Processing"
- 1.10 The Deepfake Detection Problem & Generalisation  *(from existing 1.2 + 1.3: binary def, in→cross paradox, compression robustness, datasets FF++/CDFv2, DeepfakeBench protocol)*  ← maps Trí "Music Theory & Tonic Chords"
- 1.11 eKYC Context & Legal Requirements  *(from existing 1.8: what eKYC is, TT17 QUALITATIVE + ISO/IEC 30107-3 5% convention, need for XAI)*  ← maps Trí "Problem of identifying tonic chord"
- 1.12 Liveness Detection (theory)  *(NEW from LIVENESS_RESEARCH.md: PAD/spoofing taxonomy print/replay/mask, passive vs active, APCER/BPCER/ACER, where it sits in eKYC)*  ← maps Trí "Vocal separation solution"
- 1.13 AWS — EC2 · Lambda · S3 · CloudFront · ACM · CloudWatch Logs · Elastic IP  *(NEW from aug_ch1_techstack 1.9.8 + aug_deploy context; describe each service like Trí)*
- 1.14 Conclusion  *(chapter summary)*

### CHAPTER 2: SYSTEM ANALYSIS AND DESIGN  → file `report/_en_v2/03_chapter2.md`
- 2.1 Requirement analysis
  - Functional: **Deepfake detection · Liveness detection · UI & Upload · Monitoring & Alert** (mirror Trí's 4-group shape)
  - Non-functional: Performance · Scalability · Availability & Reliability · Maintainability · Usability · Portability · Monitoring & Logging (Trí's 7)
- 2.2 System design
  - 2.2.1 Use-case diagram — Actors · Overview  *(from aug_usecases)*
  - 2.2.2 Use-case specification  *(from aug_usecases core specs)*
  - 2.2.3 System architecture — A. Frontend · B. Backend API · C. AI Inference microservice · D. Monitoring · E. Alerting (Google Chat)  *(from existing 2.2.2 + aug_deploy; label A–E exactly)*
  - 2.2.4 Activity diagrams — deepfake detection · liveness detection  *(from aug_flows)*
  - 2.2.5 Sequence diagrams — deepfake detection · liveness detection  *(from aug_flows)*
  - 2.2.6 API specifications — deepfake detection API · liveness detection API  *(from aug_apispec)*
- 2.3 Method — **Deepfake Detection (deep)**  ← maps Trí "Method to Identify the Tonic Chord"
  - Data Solutions — preprocessing · feature extraction · sequence construction (= frame sampling + MTCNN/dlib face crop+align) · label alignment · augmentation · storage optimization  *(from existing 2.3)*
  - Evaluation & loss  *(from existing 2.6 loss + 2.7 metrics)*
  - EfficientNet-B4 architecture  *(spatial branch detail)*
  - SFDCT architecture  *(from existing 2.4: two-branch, 8×8 block-DCT branch, zero-init gated cross-attn; + 2.5 five levers/four ablations as design space)*
  - **Risk-Score / Decision Inference**  ← maps Trí "Tonic Key Inference" (Motivation · Mechanism · score→band mapping · threshold τ@FPR≤5% calibration · decision_hint · summary). Use the risk.py logic (to_risk_score/risk_band/decision_hint/thresholds).
- 2.4 Method — **Liveness Detection (deep)**  ← maps Trí "Method to separate vocals (UNet & TFD_TFC_UNet)"
  - Data Solutions — collection (LCC-FASD, NUAA) · preprocessing · augmentation · parameter reasons  *(from LIVENESS_RESEARCH)*  [planned → [[FILL]] where unmeasured]
  - Architecture — reuse SFDCT B4 vs B4+DCT for PAD; cascade pre-filter (liveness → deepfake)
  - Evaluation & loss — binary CE + APCER/BPCER/ACER (analog to Trí's MAE·SDR)  ← "mine"
- 2.5 Conclusion

### CHAPTER 3: SYSTEM IMPLEMENTATION AND EVALUATION  → file `report/_en_v2/04_chapter3.md`
- 3.1 Experimental Results
  - **(Deepfake task)** Experimental environment (hardware/software/hyperparams from existing 3.1) · Data distribution (Fig 3.1) · Test data (CDFv2; Vietnamese set [[FILL planned]]) · Preprocessing consistency (Fig 3.2) · Frequency feature viz (Fig 3.11) · Per-sample analysis (real/fake examples) · Comparative distribution · Cross-dataset overlap
  - **B4 baseline — design & training**  ·  **SFDCT — design & training**  (Fig 3.3/3.4/3.5 training curves; convergence remarks)  ← maps Trí "CNN model" / "CRNN model"
  - **Comparative Evaluation** — Evaluation Definitions · main cross-dataset table (B4 0.7497 / naive 0.7572 / Row1 0.7333 / Row2 [[FILL]]) · ROC/PR (Fig 3.7/3.8) · confusion (Fig 3.9) · t-SNE (Fig 3.10) · Grad-CAM (Fig 3.12) · gate-α (Fig 3.13) · **Evaluation across 16 Experimental Configurations** (see §16-CONFIG below)  ← "mine"
  - **Discussion** — B4 vs SFDCT (does fusion help? Δ+0.0075 within noise) · impact of DCT branch / fusion · per-lever effect (Row1 negative; per-lever table [[FILL]]) · summary
  - **Conclusion** (deepfake)
  - **(Liveness)** Data · B4-liveness design/training/results [[FILL planned]] · B4+DCT-liveness design/training/results [[FILL planned]] · Conclusion  ← maps Trí "U-Net" / "TFD_TFC_UNet"
- 3.2 Implementing the system — Technology stack (Backend · Frontend · Storage · Containerization · Deployment) · Deployment Environment · Domain Registration (DNS mapping/subdomains) · System Access  *(from aug_deploy)*
- 3.3 Results — Home screen · **Deepfake Detection Screen** (Result Visualization: heatmap + frequency + risk-score · history/timeline) · **Liveness Screen**  *(app screenshots [[FILL]])*  ← maps Trí "Home / Key Chord / Vocal Separator screens"
- 3.4 Conclusion

### CONCLUSION  → goes in file `report/_en_v2/05_conclusion_refs.md`
Key Achievements · Limitations · Future Directions  *(from existing 05; keep honest limitations)*

### REFERENCES  → same file `05_conclusion_refs.md`
Keep + ensure DeepfakeBench, EfficientNet, SPSL, SRM, FcaNet, FreqDebias, FDFL, ISO/IEC 30107-3, TT17/2024/TT-NHNN, FF++, Celeb-DF-v2 all present; mark unverified [[VERIFY]].

## §16-CONFIG — the "Evaluation across 16 Experimental Configurations" (mirror Trí's 4×4=16)
Trí: 16 = 4 models (CNN/CRNN × Original/Separated input) × 4 eval (Strict/Semi × Mode-aware/not).
OURS (honest analog): **4 model configs × 4 evaluation configs = 16 cells**, needing only **4 trainings**:
- Model factor A — backbone: {B4, SFDCT};  Model factor B — frequency fusion: {OFF (spatial-only), ON (block-DCT + gated cross-attn)}. → 4 model configs: {B4-noFusion(=plain B4), B4-Fusion(≈degenerate), SFDCT-noFusion(≈B4), SFDCT-Fusion(=naive SFDCT)}. Present cleanly as 2 backbones × 2 fusion states.
- Eval factor C — dataset: {FF++ in-dataset, CDFv2 cross-dataset};  Eval factor D — operating point: {default thr 0.5, eKYC τ@FPR≤5%}.
- → 16-cell table. **Fill only measured cells**: CDFv2 @ default & @ τ for B4 (0.7497) and SFDCT (0.7572/τ=0.9514 row). **Mark all FF++-in-dataset and unmeasured fusion-state cells [[FILL — requires GPU eval]]**. Add a sentence: this design needs only 4 trainings because eval factors C/D are post-hoc.
- Mirror Trí's "Discussion" beats: backbone effect, fusion effect, dataset effect (in→cross drop), operating-point effect (default→τ collapses TPR to 0.2298).

## OUTPUT CONTRACT for each writer agent
- WRITE your assigned chapter to the exact path above (Write tool), pure Markdown, English.
- Preserve every real number, table, and `figures/...` reference from source verbatim; relabel section numbers to the new scheme.
- Keep Trí's didactic depth — do NOT shrink content. Reuse existing prose; only add for the NEW sections (JS, DNS, AWS, liveness theory/method/results, 16-config).
- Embed figures with Markdown `![caption](figures/xxx.png)` where the source referenced them.
- Every [[FILL]] must say WHAT is missing and WHY (e.g. `[[FILL — Row2 cross-dataset AUC, requires GPU training]]`).
- RETURN (as your final message) a short JSON-ish summary: sections written, word count est, count of [[FILL]], and any honesty risks you avoided.
