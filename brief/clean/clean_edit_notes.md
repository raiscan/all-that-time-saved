# All That Time Saved — clean edit handoff

## Decision and scope

Make a word-level clean-language version of the existing recorded, two-singer video. This is not a new arrangement, animation pass or lyrical rewrite. The source is `All_That_Time_Saved_storyboard_and_lyrics.md`, draft 2026-09-25, together with its four keyframe contact sheets. Do not restore wording, singer assignments, timings or scenes from an older pack.

Remove all 25 occurrences flagged in the latest source, including the mild ones. The target is removal of that explicit vocabulary, not a certification for a particular broadcaster, platform or audience. This production document and the JSON contain the original explicit wording for comparison; the clean lyric files do not.

The source's runtime ends at 4:59.4. Keep the recorded music, performance structure, two voices, original line starts, pauses, ad-libs, shot durations, cuts, prop actions and final hold. No scene redesign is proposed. No historical or company reference has been independently fact-checked in this language-edit pass; those lines are carried over verbatim.

**Helpful bots remain a fixed rule.** Do not add taunting, sabotage, malicious theft, mockery or new reaction shots to illustrate replacement words. The synthetic tree, the GP phone's 08:03, the notebook, the helpful life-card retrieval and the final phone/notebook juxtaposition all remain unchanged.

## What is supplied

- `All_That_Time_Saved_Clean_Lyrics.txt`: complete clean performance text, with all original section and singer labels and ad-libs.
- `All_That_Time_Saved_Clean_Timed_Lyrics.md`: the same clean text at the supplied line start times; replacement text is bold.
- `All_That_Time_Saved_Clean_Patches.json`: 25 word/phrase events with source IDs, timing windows, voices, shot references, original and new wording, and local edit notes. This is handoff data, not a claimed native import format for the renderer.
- This document: the locked edit policy, all patches and acceptance checks.

No audio has been generated or modified. The source supplied here is text and keyframes, not the master audio or stems. The proposed words match the source's syllable counts and intended stress positions; their audible fit and precise mouth alignment still require checking against the actual performance.

## The replacement wording

| Current wording | Clean wording | Reason for this choice |
|---|---|---|
| Less pay? Get fucked. | Less pay? Get **stuffed.** | Retains the curt British dismissal, one syllable and the stressed short “uh” vowel. The second performance can still hold that vowel. |
| taking the piss | taking the **mick** | Keeps the idiom, one syllable and the short “i” vowel. The rhyme against “this” becomes approximate rather than exact; do not rewrite the next line to repair it. |
| Same shit, faster. | Same **mess**, faster. | Keeps the complaint and the accelerated/repeated visuals, with one syllable in the same place. |
| What a fucking thrill. | What a **numbing** thrill. | Two syllables, first stressed, with the same intended short “uh” and unstressed “-ing” vowels. The contradiction keeps the sarcasm without a repeated euphemism. |
| Is this what you fucking meant? | Is this what you **really** meant? | Two syllables, natural indignation, and no change to the final “meant” action cue. |
| eight-oh-fucking-three | eight-oh-**flipping**-three | Preserves all five syllables, the number and the phone visual. One deliberately plain euphemism is preferable to rebuilding this timed gag. |
| Give me my fucking life back. | Give me my **stolen** life back. | Two syllables and a forceful demand. “Stolen” is the narrator's description of lost time/life, not a new claim that the helper bot deliberately took it. Keep the existing helpful retrieval exactly as staged. |
| your fucking beta test | your **little** beta test | Two syllables and a dismissive delivery; the film-set gag and “beta test” anchor stay intact. |
| I still fucking do. | I still **really** do. | Two syllables that let the line remain sincere rather than inserting a comic substitute or censor effect. |
| talk pure bollocks | talk pure **nonsense** | Two syllables, same conversational meaning; the duck bubble already supports it. |
| pissed off | **hacked** off | One syllable before the unchanged “off”; retains an annoyed British voice. Use in both bridge lines. |
| I'm pissed off I'm still fucking waiting outside. | I'm **hacked** off I'm still **stuck here** waiting outside. | “Stuck here” replaces the two syllables of the intensifier while preserving the depicted position and the words “waiting outside”. This creates one extra caption token but no additional sung syllable. |

Do not change “fucking” globally to a single replacement. Its function differs between the sarcastic hook, the demand, the GP interruption and the sincere breakdown. Treat each E-number as the approved local substitution.

## Exact occurrence list

Times and durations below are copied from the source's explicit-word inventory. They are rounded references, not independently measured, sample-accurate edit points. The syllable counts in the last column are intended performance counts; retain two syllables for “really” rather than compressing it into one.

| ID | Source start | Source shot | Voice | Replacement | Supplied slot | Syllables |
|---|---|---|---|---|---|---|
| E1 | 1:03.6 | P1b (Pre-Chorus) | her | fucked → stuffed | 0.44 s | 1 → 1 |
| E2 | 1:07.7 | C1a (Chorus) | her | piss → mick | 0.20 s | 1 → 1 |
| E3 | 1:08.6 | C1b (Chorus) | backing | piss → mick | 0.18 s | 1 → 1 |
| E4 | 1:15.5 | C1d (Chorus) | her | shit → mess | 0.22 s | 1 → 1 |
| E5 | 1:17.2 | C1d (Chorus) | her | fucking → numbing | 0.46 s | 2 → 2 |
| E6 | 1:26.5 | C1f (Chorus) | her | fucking → really | 0.44 s | 2 → 2 |
| E7 | 2:02.9 | V2g (Verse 2) | him | eight-oh-fucking-three → eight-oh-flipping-three | 1.36 s | 5 → 5 |
| E8 | 2:10.0 | V2h (Verse 2) | him | fucking → stolen | 0.44 s | 2 → 2 |
| E9 | 2:17.8 | P2b (Pre-Chorus) | her | fucked → stuffed | 2.06 s | 1 → 1 |
| E10 | 2:20.7 | C2a (Chorus) | her | piss → mick | 0.38 s | 1 → 1 |
| E11 | 2:22.8 | C2b (Chorus) | backing | piss → mick | 0.34 s | 1 → 1 |
| E12 | 2:29.8 | C2d (Chorus) | her | shit → mess | 0.20 s | 1 → 1 |
| E13 | 2:31.5 | C2d (Chorus) | her | fucking → numbing | 0.46 s | 2 → 2 |
| E14 | 2:42.0 | C2f (Chorus) | her | fucking → really | 0.44 s | 2 → 2 |
| E15 | 3:29.4 | V3e (Verse 3) | him | fucking → little | 0.46 s | 2 → 2 |
| E16 | 3:48.3 | D1 (Breakdown) | him | fucking → really | 0.42 s | 2 → 2 |
| E17 | 4:03.1 | F2 (Bridge) | her | bollocks → nonsense | 0.42 s | 2 → 2 |
| E18 | 4:13.3 | F4 (Bridge) | her | pissed → hacked | 0.48 s | 1 → 1 |
| E19 | 4:17.3 | F4 (Bridge) | her | pissed → hacked | 0.36 s | 1 → 1 |
| E20 | 4:19.7 | F4 (Bridge) | her | fucking → stuck here | 0.42 s | 2 → 2 |
| E21 | 4:25.1 | Z1 (Final Chorus) | her | piss → mick | 0.18 s | 1 → 1 |
| E22 | 4:26.0 | Z1 (Final Chorus) | backing | piss → mick | 0.20 s | 1 → 1 |
| E23 | 4:32.9 | Z2 (Final Chorus) | her | shit → mess | 0.24 s | 1 → 1 |
| E24 | 4:34.7 | Z3 (Final Chorus) | her | fucking → numbing | 0.50 s | 2 → 2 |
| E25 | 4:35.9 | Z3 (Final Chorus) | backing | shit → mess | 0.30 s | 1 → 1 |

All four offscreen backing occurrences need their own audio and subtitle edits: E3, E11, E22 and E25. The existing clean echoes “What a thrill!”, “Oh”, “Oooh” and the verse-one ad-libs stay as supplied. Do not assign those backing voices to bots.

## Timing-sensitive cues

### E1 / E9 — the stamps and the held word

Keep both stamp impacts at their present frame times. Put “stuffed” into each original vocal envelope, preserving the stressed vowel's relationship to the hit. E1 is short; E9 is a 2.06-second held word. Sing the second as one sustained syllable, not “stuff-ed”. Do not truncate it to fit the nominal end of P2b: the supplied vocal timing runs into the next section. Preserve the existing overlap and release.

### E7 — the 08:03 gag

Keep “What?!”, “eight-oh”, “three” and the displayed 08:03. The supplied 1.36-second window covers the **whole compound** “eight-oh-fucking-three”, not just the profanity. The pack does not give the internal onset or duration of that infix. Find it in the audio; do not fabricate internal timestamps or compress the entire phrase. “Flipping” takes the existing two infix syllables.

### E6 / E14 — the tear and burn

“Really” replaces only the two-syllable intensifier. The final word “meant”, the tear, the burn and the transition all keep their existing anchors. Do not move the action to the replacement word just because it is being edited.

### E8 — the life-card retrieval

“Stolen” is sung as STO-len in the original two-syllable slot. The card stays caught in the checkout mechanism; the bot still helps him pull it free. No new gesture, perpetrator or theft imagery is required. Preserve “life back” and the successful pull.

### E16 / E17 — the emotional sequence

Keep “I still really do” low and sincere. Retain the reach into the drawn light and the timing of “do”. “Pure nonsense” accompanies the existing rubber-duck conversational turn. Do not add jokes, censor sounds or new illustrations to either passage.

### E18 / E19 / E20 — the bridge and the extra caption token

Only “pissed” becomes “hacked” in each bridge line. Keep both occurrences of “off”, and preserve the first line's “not”. The last two-syllable intensifier becomes **STUCK here**, strong then light, within the old 0.42-second target envelope.

This is the only substitution that turns one subtitle token into two. Give the pair the old word's overall time span, but align the internal reveal of “here” to the actual replacement recording. No exact internal split is available from the supplied pack. Do not split it arbitrarily in half, move “waiting”, change the notebook movement or close the notebook earlier. The lyric remains “waiting outside”, as in the existing film.

### E24 / E25 — the last bill and overlapping echo

E24 is listed at 4:34.7 for a 0.50-second slot, crossing the nominal Z2/Z3 boundary. Preserve that source event and conform to the actual audio rather than forcing it into one shot. Keep “thrill” and the bill landing in place. Replace the separate backing “shit” with “mess” at E25 without moving the faster digging.

## Audio and animation implementation

Keep an untouched explicit master and make a separate clean version. Start from the finished edit, not a fresh full-song generation. Full-song regeneration is outside the scope of this patch plan.

Where replacement recording is possible, capture enough neighbouring phrase for a natural entrance and exit, then conform the pickup to the existing master. A word-only splice is the goal, not a guarantee: coarticulation may require a little surrounding audio. Do not change the words or external anchors of the surrounding phrase. Match the existing singer, pitch movement, vowel length, intensity, room/reverb and overlap; fit locally instead of stretching a whole verse or moving the picture.

The supplied timings are for locating edits. Inspect the master waveform and actual rendered frame timing before choosing splice or crossfade points. Do not assume that matching syllable count means matching phonemes or identical lip-sync. Update mouth shapes only where the affected singer is visible, including short anticipatory/coarticulatory frames if needed, inside the fixed shot timing. Some changes occur entirely on inserts or offscreen backing, so there is no reason to reanimate a character for those words.

Replace caption content while retaining all unchanged words' highlight times. Review line wrapping and text bounds after changing word lengths, especially “numbing”, “nonsense”, “eight-oh-flipping-three” and “stuck here”. Update the small backing-vocal captions as well as the lead subtitles. When captions are baked into frames, re-render those affected caption intervals; changing a separate transcript alone does not clean the visible video.

A stem-based edit should preserve the instrumental bed. Check lead doubles, harmonies, echoes and reverb tails for surviving explicit audio. Avoid a series of novelty bleeps: none is required by the lyric plan, and the sincere breakdown/bridge particularly benefits from natural words. A censored-audio fallback would be a separate editorial decision, not something to substitute silently for these replacement lyrics.

## Acceptance checks

1. The 25 E-events have all been addressed: 21 lead occurrences and 4 offscreen backing occurrences. No listed explicit word remains in the clean audible vocals or visible lyric text.
2. Every replacement uses the intended source syllable count; short words remain short and E9 remains a single held syllable. The vocal performance has been auditioned, not merely counted on paper.
3. All original line start times, music, shot cuts, total duration, actions and non-edited lyric words are unchanged. Local pickups do not cause drift into later scenes.
4. The GP still says “eight-oh-flipping-three” while the phone reads 08:03. The stamps, “meant”, “life back”, “beta test”, the notebook action, “waiting outside” and final bill landing retain their existing cue relationships.
5. E20's new second caption token is locally aligned to the replacement voice. No downstream captions are shifted and no text clips its existing container.
6. The four backing patches are present, with no bot lip-sync or malicious character reinterpretation. Bots remain sincere helpers in every shot.
7. The bridge is still sincere; the conversation bubble is still playful; the final spoken lines and ending hold are unchanged.
8. Listen to the full clean mix in sync with the final video, including the overlaps and transition tails. Inspect the original E1–E25 keyframe positions and compare the clean picture against the explicit master.

## Source and limits

Source basis: the supplied pack's “The aim: a clean version”, “The explicit words” (E1–E25), “The lyric, timed”, and the shot descriptions associated with those events. The keyframe sheets show still frames, not a playable performance. No audio master has been auditioned and no rendered clean video is claimed here. The original source file and previous feedback documents were not altered.
