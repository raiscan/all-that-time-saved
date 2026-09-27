"""transcribe.py: word-level timestamps for a song's vocals (faster-whisper), for aligning the lyrics.

    .venv/bin/python tools/transcribe.py assets/song.mp3 --out out/audio/words.json [--model large-v3]

Writes [{start, end, word, prob}]. tools/lyrics.py then aligns brief/lyrics.md against these words.
"""
import argparse, json, os, time
from faster_whisper import WhisperModel

ap = argparse.ArgumentParser()
ap.add_argument('audio')
ap.add_argument('--out', default='out/audio/words.json')
ap.add_argument('--model', default='large-v3')
ap.add_argument('--prompt', default='', help='initial prompt (e.g. the first lyric lines) to bias the vocabulary')
a = ap.parse_args()
t0 = time.time()
model = WhisperModel(a.model, device='cpu', compute_type='int8', cpu_threads=os.cpu_count())
segs, info = model.transcribe(a.audio, language='en', word_timestamps=True, vad_filter=False, beam_size=5,
                              condition_on_previous_text=False, initial_prompt=a.prompt or None)
words = []
for s in segs:
    for w in s.words:
        words.append({'start': round(w.start, 3), 'end': round(w.end, 3), 'word': w.word.strip(), 'prob': round(w.probability, 3)})
    print(f'{s.start:7.2f}–{s.end:7.2f}  {s.text.strip()}', flush=True)
os.makedirs(os.path.dirname(a.out) or '.', exist_ok=True)
json.dump(words, open(a.out, 'w'), indent=0)
print(f'{len(words)} words in {time.time() - t0:.0f}s → {a.out}')
