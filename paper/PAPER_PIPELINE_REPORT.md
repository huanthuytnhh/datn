# Paper Writing Pipeline Report

**Input:** NARRATIVE_REPORT.md · **Venue:** IEEE_CONF · **Assurance:** draft · **Submission-ready:** no (cần compile + bootstrap-video + ablation)

## Pipeline summary
| Phase | Status | Output |
|---|---|---|
| 0. Assurance | ✅ | paper/.aris/assurance.txt = draft |
| 1. Plan | ✅ | paper/PAPER_PLAN.md (Claims–Evidence matrix) |
| 2. Figures | ✅ (tái dùng) | paper/figures/ (12 PNG từ report/figures) |
| 3. LaTeX | ✅ | paper/main.tex (IEEEtran, 7 mục) + references.bib (16 ref, credit đầy đủ) |
| 4. Compile | ⛔ **BLOCKED** | Môi trường KHÔNG có pdflatex/latexmk/IEEEtran → compile trên Overleaf |
| 5. Improve | ⏸️ | cần PDF (chạy `/auto-paper-improvement-loop` sau khi compile) |
| Preview | ✅ | paper/main_preview.docx + .html (pandoc, hình nhúng) |

## Framing (trung thực — theo IDEA_REPORT)
- KHÔNG claim SOTA: naive 0.7572 < SPSL 0.7650; Δ+0.0075 **trong nhiễu** (CI [−0.004,+0.019]).
- 3 đóng góp: C1 floor-preserving fusion (zero-init gate) · C2 eKYC operating-point + ISO/IEC 30107-3 · C3 VN-face test set.
- TT17 = yêu cầu **định tính**, ta CHỌN FPR≤5% theo ISO 30107-3 (KHÔNG viết "TT17 quy định 5%").
- Phân biệt SFCL-HCMF (gate init 0.5 vs α=0 floor).

## Cách compile ra PDF (môi trường này không có TeX)
1. **Overleaf:** tạo project mới → upload `paper/` (main.tex, references.bib, figures/) → chọn compiler pdfLaTeX → biên dịch.
2. Hoặc máy có TeX Live: `cd paper && latexmk -pdf main.tex`.

## TODO trước khi nộp (đã đánh dấu \todo trong main.tex)
- [ ] Compile PDF (Overleaf).
- [ ] Bootstrap CI **cấp-video** (không frame) + multi-seed.
- [ ] Ablation per-knob S1–S5; Row2; DFDC; demo infer.
- [ ] Thu bộ VN-face (C3) + datasheet + ethics.
- [ ] Verify metadata FreqDebias/SFCL-HCMF/TT17 trong references.bib.
- [ ] Sau khi có PDF: chạy `/auto-paper-improvement-loop "paper/"`.

## Deliverables
- paper/main.tex · references.bib · PAPER_PLAN.md · figures/ (12) · main_preview.{docx,html} · .aris/assurance.txt
