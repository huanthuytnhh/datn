# DeepGuard — B4 + DCT on DeepfakeBench: setup & workflow

This package adds a **DCT-residual attention** detector on top of DeepfakeBench's
EfficientNet-B4, and gives you a `local-small -> vast-small -> vast-big` workflow.

## Where each file goes (inside your fork)

```
DeepfakeBench/
|-- training/
|   |-- detectors/
|   |   |-- __init__.py                      <-- EDIT: add 1 import line
|   |   |-- efficientnetb4_detector.py       (already exists; baseline)
|   |   `-- efficientnetb4_dct_detector.py   <-- NEW (from this package)
|   |-- networks/
|   |   `-- fca_layer.py                      <-- COPY from FcaNet (see step 1)
|   `-- config/detector/
|       |-- efficientnetb4.yaml               (already exists; baseline)
|       `-- efficientnetb4_dct.yaml           <-- NEW (from this package)
`-- tools/
    `-- make_subset.py                         <-- NEW (from this package)
```

## One-time install (4 actions)

1. **Copy FcaNet layer.** From https://github.com/cfzd/FcaNet , open `model/layer.py`
   and copy it to `training/networks/fca_layer.py`. It must contain
   `MultiSpectralAttentionLayer`, `MultiSpectralDCTLayer`, `get_freq_indices`.
   Then check the import/signature note at the top of `efficientnetb4_dct_detector.py`.

2. **Add the detector file** `efficientnetb4_dct_detector.py` to `training/detectors/`.

3. **Register it.** Open `training/detectors/__init__.py` and add (matching the style
   of the other imports there):
   ```python
   from .efficientnetb4_dct_detector import EfficientDCTDetector
   ```

4. **Add the config** `efficientnetb4_dct.yaml` to `training/config/detector/`.

> Verify `dct_channels` (default 1792). Run one batch and print
> `self.backbone.features(data_dict['image']).shape` — the channel dim is the value to set.

## Data paths (separate from the detector config)

`rgb_dir` / `lmdb_dir` and `dataset_json_folder` live in `train_config.yaml`
(and the test config). Point them at where you mounted the preprocessed data
(e.g. `/kaggle/input/...` or, on Vast, the folder you downloaded into).
You only need **FF++ (c23)** + **Celeb-DF-v2** + their JSON configs.

---

## The 3-phase workflow

### Phase 1 — local-small: smoke-test the BASELINE (no DCT)
Goal: prove the pipeline runs end to end and measure minutes/epoch. Numbers don't matter.

```bash
# make tiny subsets (run from DeepfakeBench/)
python tools/make_subset.py --json preprocessing/dataset_json/FaceForensics++.json --keep 10
python tools/make_subset.py --json preprocessing/dataset_json/Celeb-DF-v2.json   --keep 5
# point dataset_json_folder at the *_subset.json, then in efficientnetb4.yaml set [SMOKE] values:
#   nEpochs: 1   |   frame_num: {'train': 4, 'test': 4}   |   train_batchSize: 16

python training/train.py \
  --detector_path ./training/config/detector/efficientnetb4.yaml \
  --train_dataset "FaceForensics++" --test_dataset "FaceForensics++" "Celeb-DF-v2"
```
PASS if: data loads, loss decreases, an AUC prints for BOTH FF++ and Celeb-DF, a
checkpoint is written. (A tiny subset at 256px runs even on CPU / a modest GPU.)

### Phase 2 — add the DCT module (no GPU)
Do the 4 install actions above and commit them to your fork.

### Phase 3 — vast-small: smoke-test B4 + DCT on the SAME subset
```bash
python training/train.py \
  --detector_path ./training/config/detector/efficientnetb4_dct.yaml \
  --train_dataset "FaceForensics++" --test_dataset "FaceForensics++" "Celeb-DF-v2"
```
PASS if: no shape error (confirms `dct_channels`), the log line `[DCT] ...` appears,
`alpha` is in the optimizer's parameters, loss decreases. AUC value is not the point yet.

### Phase 4 — vast-big: full ablation (lock the config)
Restore FULL values in BOTH yamls: `nEpochs: 10`, `frame_num: 32`, `train_batchSize: 32`,
`lr: 0.0002`. Point data paths back to the FULL json folder.

Run 4 configs, all with the SAME batch / lr / epochs / seed list:
1. B4 (baseline)                 -> `efficientnetb4.yaml`
2. B4 + SE attention             (shows DCT > GAP-based attention)
3. B4 + DCT-concat (no residual) (shows residual matters)
4. B4 + DCT-residual (proposed)  -> `efficientnetb4_dct.yaml`

Staged to balance rigour vs time:
- Configs **1 and 4** (the main claim): run x3 seeds (1024 / 2025 / 7) -> mean +/- std + paired t-test.
- Configs **2 and 3**: x1 seed first; add x3 later if time allows.
- Always evaluate on FF++ (within) AND Celeb-DF-v2 (cross).

To change seed per run, edit `manualSeed` in the yaml (or pass an override if your
fork's `train.py` supports one). Save checkpoints to a persistent path; if a session
is interrupted, resume with `start_epoch` + the last checkpoint.

---

## Fairness rules (do not break these)
- Same `train_batchSize`, `lr`, `nEpochs`, and seed list for **every** ablation config.
  Otherwise a difference cannot be attributed to the DCT module.
- Your **own** B4 run is the baseline to beat — NOT the 0.749 from the benchmark table
  (your epochs/frames/GPU differ from the paper).
- Watch the **Celeb-DF-v2 (cross)** column most: improving it over your own baseline is
  the strongest result; improving only FF++ (within) invites "isn't that just overfitting FF++?".
