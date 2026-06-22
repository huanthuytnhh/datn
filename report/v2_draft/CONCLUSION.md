# CONCLUSION

## Achieved Results

This thesis built a deepfake detector for electronic Know-Your-Customer (eKYC) onboarding in banking, with the groundwork for a complementary liveness layer. The detector had to generalise to manipulations it has never seen, since an attacker will not reuse the training-set forgeries, so the cross-dataset score is the one that matters. The proposed method, SFDCT, fuses a block-DCT frequency branch with a convolutional backbone. The improved variant, SFDCT-HFF, keeps the frequency information as a high-pass image. Both are trained on FaceForensics++ [2] and tested cross-dataset on Celeb-DF-v2 [3] under the standard protocol, with frame-level area under the curve (AUC) as the main metric.

The frequency branch runs in parallel with the spatial backbone and merges through a gate that starts closed, so the model begins identical to the baseline and the branch only gains influence when it lowers the loss. This gives a performance floor, a useful property in banking, unlike a related model whose gate starts half open. Under the standard protocol the baseline reaches a frame-level AUC of 0.7497 on Celeb-DF-v2, close to the published figure for the same backbone [1], so the pipeline is comparable and the gains are not measured against a weak baseline. The frequency branch raises the score to 0.7572 and the high-pass variant to 0.7695, the best of the family and the only one with a positive paired difference at the video level. The direction agrees with the two-domain hypothesis, but the margins sit inside the single-seed noise band and are not a state-of-the-art claim.

For eKYC, the thesis calibrates an operating point where the false-positive rate is at most 5 percent, following ISO/IEC 30107-3 [13] as an engineering choice that satisfies the qualitative requirement of Circular 17/2024/TT-NHNN [14]. At this customer-friendly point the detector still misses most deepfakes, so it fits as a first screening layer for review rather than the final decision. The complementary liveness module reaches an AUC of 0.98 with an ACER of 6.85 percent on LCC-FASD [28], with no measurable gain from the frequency branch. The system runs end to end, returning a fake probability, a verdict, and a Grad-CAM [9] heat map for each face, served on the processor with no graphics card, with explainability supporting both the reviewing officer and the audit obligations of eKYC.

## Limitations

Every number comes from a single run per configuration, so no significance is claimed: the video-level intervals all contain zero, confirming that no variant separates from the baseline at this seed. The improvement is modest and not state of the art, and the strongest known data-side technique is outside the present scope. Training and serving do not crop faces identically, which can shift the live operating point and should be fixed before production. Robustness was not tested systematically, including re-compression, noise, resolution changes, and adversarial perturbations.

The liveness module is measured within one dataset only. Its cross-dataset behaviour is unchecked, and the cascade still uses an interim challenge check rather than the trained scorer. No Vietnamese-face evaluation exists yet: the set is specified as a test-only probe, with collection in progress, and no number is reported before it is measured. The in-dataset half of the grid and a second cross-dataset set also remain open items, and the application database design is not yet complete.

## Development Directions

Several directions follow from these limitations:

- The measured liveness layer should be wired into the cascade, fusing its learned score with the deepfake risk score, and tested on a replay-heavy set.
- Each configuration should run over several seeds with a paired significance test, to settle whether the frequency gain is genuine.
- The test-only Vietnamese-face set should be built and used to measure generalisation to the real eKYC population, following the population-shift precedent of KoDF [16], and the cross-dataset evaluation should be widened to sets such as DFDC [15], covering more manipulation types and capture conditions, including diffusion-based forgeries.
- A self-blended training strategy [18], the strongest cross-dataset technique available, can be integrated and combined with the frequency branch.
- Finally, the system should be hardened by unifying the training and serving crop, evaluating robustness, completing the application database design, and applying quantisation, pruning, and distillation for edge and mobile use.
