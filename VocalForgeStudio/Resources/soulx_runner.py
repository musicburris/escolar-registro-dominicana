"""VocalForge adapter for SoulX-Singer-SVC on Apple Silicon."""
import argparse
import os
from pathlib import Path
import numpy as np
import torch

os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")

from preprocess.pipeline import PreprocessPipeline
from soulxsinger.utils.file_utils import load_config
from cli.inference_svc import build_model, process


def best_device():
    requested = os.environ.get("VOCALFORGE_ULTRA_DEVICE", "auto")
    if requested != "auto":
        return requested
    return "mps" if torch.backends.mps.is_available() else "cpu"


def preprocess(root: Path, audio: Path, output: Path, separate: bool, device: str):
    pipeline = PreprocessPipeline(device=device, language="English", save_dir=str(output),
                                  vocal_sep=separate, max_merge_duration=30000,
                                  midi_transcribe=False)
    pipeline.run(audio_path=str(audio), vocal_sep=separate)
    return output / "vocal.wav", output / "vocal_f0.npy"


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--source", required=True)
    p.add_argument("--reference", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--steps", type=int, default=48)
    p.add_argument("--cfg", type=float, default=2.0)
    p.add_argument("--transpose", type=int, default=0)
    p.add_argument("--source-is-vocal", action="store_true")
    args = p.parse_args()

    root = Path(__file__).resolve().parent
    out = Path(args.output)
    out.mkdir(parents=True, exist_ok=True)
    device = best_device()
    print(f"VOCALFORGE_ULTRA_DEVICE={device}", flush=True)

    ref_wav, ref_f0 = preprocess(root, Path(args.reference), out / "reference", False, device)
    src_wav, src_f0 = preprocess(root, Path(args.source), out / "source", not args.source_is_vocal, device)
    config = load_config(str(root / "soulxsinger/config/soulxsinger.yaml"))
    model = build_model(str(root / "pretrained_models/SoulX-Singer/model-svc.pt"), config, device, False)

    class A: pass
    a = A()
    a.device = device
    a.prompt_wav_path, a.prompt_f0_path = str(ref_wav), str(ref_f0)
    a.target_wav_path, a.target_f0_path = str(src_wav), str(src_f0)
    a.save_dir = str(out / "generated")
    a.auto_shift = args.transpose == 0
    a.pitch_shift = args.transpose
    a.n_steps, a.cfg, a.use_fp16 = args.steps, args.cfg, False
    process(a, config, model)


if __name__ == "__main__":
    main()
