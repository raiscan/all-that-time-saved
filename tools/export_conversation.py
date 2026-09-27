#!/usr/bin/env python3
"""export_conversation.py: the making of the film as a conversation, in markdown (docs/making-of/conversation.md).

Reads Claude Code's session log for this project (~/.claude/projects/<project>/<session>.jsonl, the main thread only)
and writes the dialogue as it was seen: UncleHerbert's messages (typed, sent mid-turn, and answers to questions) and
Claude's replies. Left out: tool calls and their output (thousands of renders and commands), the helper agents'
transcripts, Claude's hidden reasoning, and the harness's own system text. Images are marked [image]. Personal details
(an email address, a name, home paths) are scrubbed.

    .venv/bin/python tools/export_conversation.py [--session <id>]   (the newest session by default)
"""
import argparse, glob, json, os, re
from datetime import datetime

PROJ = os.path.expanduser('~/.claude/projects/' + os.path.abspath('.').replace('/', '-'))
OUT = 'docs/making-of/conversation.md'
HOME = os.path.abspath('.')

import getpass
_ME = re.escape(getpass.getuser())
SCRUB = [   # (personal details: any email address; home paths; the login name, and a surname after it)
    (re.compile(r'[\w.+-]+@[\w-]+(\.[\w-]+)+'), '[email]'),
    (re.compile(re.escape(HOME) + r'/?'), ''),
    (re.compile(re.escape(os.path.expanduser('~')) + r'/'), '~/'),
    (re.compile(r'(?i)\b' + _ME + r'\b(\s+[A-Z][\w]+)?'), 'UncleHerbert'),
]
TAGS = re.compile(r'<(system-reminder|command-[\w-]+|local-command-[\w-]+|task-notification|agent-message|cross-session-message)\b[^>]*>.*?</\1>', re.S)

def scrub(s):
    for rx, rep in SCRUB: s = rx.sub(rep, s)
    return s

def text_of(content):
    if isinstance(content, str): return content
    out = []
    for b in content or []:
        if not isinstance(b, dict): continue
        if b.get('type') == 'text': out.append(b.get('text', ''))
        elif b.get('type') == 'image': out.append('[image]')
    return '\n'.join(out)

def clean_user(s):
    s = TAGS.sub('', s)
    s = re.sub(r'\[Image #\d+\]|\[Image: [^\]]*\]', '[image]', s)
    return s.strip()

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--session'); a = ap.parse_args()
    logs = sorted(glob.glob(f'{PROJ}/*.jsonl'), key=os.path.getmtime)
    path = next((p for p in logs if a.session and a.session in p), logs[-1])
    turns, seen_asst, t0, t1 = [], {}, None, None
    def add(who, text, ts):
        text = scrub(text).strip()
        if not text: return
        if turns and turns[-1][0] == who and who == 'Claude': turns[-1][1].append(text); return
        turns.append([who, [text], ts])
    with open(path, 'rb') as f:
        for raw in f:
            try: e = json.loads(raw)
            except Exception: continue
            if e.get('isSidechain'): continue
            ts = e.get('timestamp')
            if ts:
                d = datetime.fromisoformat(ts.replace('Z', '+00:00'))
                t0 = t0 or d; t1 = d
            t = e.get('type')
            if t == 'user':
                m = e.get('message') or {}
                if e.get('isCompactSummary') or e.get('isMeta'): continue
                c = m.get('content')
                if isinstance(c, list) and any(isinstance(b, dict) and b.get('type') == 'tool_result' for b in c):
                    for b in c:   # (an answer to one of Claude's questions)
                        if isinstance(b, dict) and b.get('type') == 'tool_result':
                            r = text_of(b.get('content')) if not isinstance(b.get('content'), str) else b['content']
                            if re.match(r'(The user answered|User has answered your questions|Your questions have been answered)', r):
                                body = r.split(':', 1)[1]
                                ans = re.findall(r'"(.*?)"="(.*?)"(?=, "|\.\s|\.?\s*$)', body, re.S)
                                add('UncleHerbert', '\n\n'.join(f'*{q}*\n→ {v}' for q, v in ans) or body.strip(), ts)
                    continue
                s = clean_user(text_of(c))
                if s.startswith('This session is being continued from a previous conversation'): continue
                add('UncleHerbert', s, ts)
            elif t == 'attachment' and (e.get('attachment') or {}).get('type') == 'queued_command':
                p = e['attachment'].get('prompt')
                s = clean_user(text_of(p) if not isinstance(p, str) else p)
                add('UncleHerbert', s, ts)
            elif t == 'assistant':
                m = e.get('message') or {}
                for i, b in enumerate(m.get('content') or []):
                    if isinstance(b, dict) and b.get('type') == 'text':
                        k = (m.get('id'), b.get('text', '')[:80])
                        if k in seen_asst: continue
                        seen_asst[k] = 1
                        add('Claude', b.get('text', ''), ts)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    n_u = sum(1 for w, *_ in turns if w == 'UncleHerbert')
    with open(OUT, 'w') as f:
        f.write('# The making of "All That Time Saved": the conversation\n\n')
        f.write(f'UncleHerbert directing Claude (Opus 5.5) in Claude Code, orchestrated in T3 Code, '
                f'{t0:%-d %B} to {t1:%-d %B %Y}: {n_u} messages from UncleHerbert and Claude\'s replies, as they were seen. '
                'Left out: the tool calls and their output (the renders, commands and edits: the git history has every change), '
                'the helper agents\' own transcripts, Claude\'s hidden reasoning, and the harness\'s system text. '
                'Generated by `tools/export_conversation.py`.\n\n---\n\n')
        day = None
        for who, parts, ts in turns:
            d = datetime.fromisoformat(ts.replace('Z', '+00:00')).astimezone() if ts else None
            if d and d.date() != day:
                day = d.date(); f.write(f'\n## {d:%A %-d %B %Y}\n\n')
            stamp = f' <sub>{d:%H:%M}</sub>' if d else ''
            body = '\n\n'.join(parts)
            if who == 'UncleHerbert':
                f.write(f'**UncleHerbert**{stamp}\n\n' + '\n'.join('> ' + l if l.strip() else '>' for l in body.split('\n')) + '\n\n')
            else:
                f.write(f'**Claude**{stamp}\n\n{body}\n\n')
    print(OUT, f'{len(turns)} turns ({n_u} from UncleHerbert)', f'{os.path.getsize(OUT) / 1e6:.1f} MB')

main()
