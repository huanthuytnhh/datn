"""
make_subset.py — build a tiny subset of DeepfakeBench JSON config(s) for smoke-testing.

Keeps only the first N videos per group so training runs in minutes (Phase 1 / Phase 3).
DeepfakeBench JSON nesting can vary by version, so this script:
  1) prints the structure of the input JSON (CONFIRM it before trusting the output),
  2) trims video-level entries generically (a "video" = a dict holding a list of frame paths),
  3) writes <name>_subset.json next to the original.

Usage (run from DeepfakeBench/):
  python tools/make_subset.py --json preprocessing/dataset_json/FaceForensics++.json --keep 10
  python tools/make_subset.py --json preprocessing/dataset_json/Celeb-DF-v2.json   --keep 5

Then either:
  - put the *_subset.json into a separate folder and point dataset_json_folder
    (in train_config.yaml) at that folder, or
  - back up the originals and rename *_subset.json over them.

If the printed structure does not look like {... -> {video_id -> {frames:[...]}}},
adjust is_video_entry()/trim() before using the result.
"""
import argparse
import copy
import json


def is_video_entry(v):
    """A video entry is a dict that holds a list of frame paths somewhere inside it."""
    if not isinstance(v, dict):
        return False
    for val in v.values():
        if isinstance(val, list) and val and isinstance(val[0], str):
            return True
        if isinstance(val, dict):  # frames sometimes nested one level deeper
            for vv in val.values():
                if isinstance(vv, list) and vv and isinstance(vv[0], str):
                    return True
    return False


def describe(obj, depth=0, max_depth=4):
    pad = "  " * depth
    if isinstance(obj, dict):
        keys = list(obj.keys())
        print(f"{pad}dict[{len(keys)}]  e.g. keys {keys[:3]}")
        if depth < max_depth and keys:
            describe(obj[keys[0]], depth + 1, max_depth)
    elif isinstance(obj, list):
        print(f"{pad}list[{len(obj)}]  e.g. {obj[:1]}")
    else:
        print(f"{pad}{type(obj).__name__}: {str(obj)[:50]}")


def trim(obj, keep):
    """Recurse; at the first level whose children are video entries, keep `keep` of them."""
    if isinstance(obj, dict):
        videos = [k for k, v in obj.items() if is_video_entry(v)]
        if videos:
            kept = videos[:keep]
            return {k: obj[k] for k in kept}
        return {k: trim(v, keep) for k, v in obj.items()}
    return obj


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", required=True, help="path to a DeepfakeBench dataset json")
    ap.add_argument("--keep", type=int, default=10, help="videos to keep per group")
    args = ap.parse_args()

    with open(args.json) as f:
        data = json.load(f)

    print("=== STRUCTURE OF INPUT JSON (verify before trusting the subset) ===")
    describe(data)

    subset = trim(copy.deepcopy(data), args.keep)

    out = args.json.replace(".json", "_subset.json")
    with open(out, "w") as f:
        json.dump(subset, f)

    print(f"\nWrote subset -> {out}")
    print("If the structure above looked unexpected, edit is_video_entry()/trim() first.")
