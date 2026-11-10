#!/usr/bin/env bash
# One-time setup for the Dig Deeper engine: Python packages + Kokoro voice model.
set -e
cd "$(dirname "$0")"
pip install --break-system-packages -q pycairo numpy kokoro-onnx soundfile 2>&1 | grep -v -i warning || true
mkdir -p models
[ -s models/kokoro-v1.0.onnx ] || curl -sSL -o models/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
[ -s models/voices-v1.0.bin ] || curl -sSL -o models/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
fc-list | grep -qi "Noto Color Emoji" || echo "WARNING: Noto Color Emoji font missing (apt-get install fonts-noto-color-emoji)"
fc-list | grep -qi "Poppins" || echo "WARNING: Poppins font missing"
python3 -c "import cairo, kokoro_onnx; print('engine ready')"
