#!/usr/bin/env python3
"""
Utility script that compares two base64-encoded WAV samples using speaker embeddings.
The script reads a JSON payload from stdin:
{
  "stored": "<base64-string>",
  "incoming": "<base64-string>",
  "threshold": 0.6
}
and prints {"similarity": float, "match": bool} on stdout.
"""

import base64
import json
import os
import sys
import tempfile

import numpy as np
from resemblyzer import VoiceEncoder, preprocess_wav

encoder = VoiceEncoder()


def decode_sample(data: str) -> str:
    """Decode a base64 string into a temporary WAV file and return its path."""
    audio_bytes = base64.b64decode(data)
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    temp_file.write(audio_bytes)
    temp_file.flush()
    temp_file.close()
    return temp_file.name


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Compute cosine similarity between two embedding vectors."""
    a_norm = np.linalg.norm(a)
    b_norm = np.linalg.norm(b)
    if a_norm == 0 or b_norm == 0:
        return 0.0
    return float(np.dot(a, b) / (a_norm * b_norm))


def main() -> None:
    raw = sys.stdin.read()
    payload = json.loads(raw)

    stored_b64 = payload["stored"]
    incoming_b64 = payload["incoming"]
    threshold = float(payload.get("threshold", 0.6))

    stored_path = decode_sample(stored_b64)
    incoming_path = decode_sample(incoming_b64)

    try:
        stored_embedding = encoder.embed_utterance(preprocess_wav(stored_path))
        incoming_embedding = encoder.embed_utterance(preprocess_wav(incoming_path))
        score = cosine_similarity(stored_embedding, incoming_embedding)
        result = {"similarity": score, "match": score >= threshold}
        print(json.dumps(result))
    finally:
        for path in (stored_path, incoming_path):
            if os.path.exists(path):
                os.unlink(path)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # pragma: no cover
        print(str(exc), file=sys.stderr)
        sys.exit(1)
