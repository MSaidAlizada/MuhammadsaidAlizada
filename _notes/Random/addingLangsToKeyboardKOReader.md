---
layout: note
title: "Adding a New Language Keyboard to KOReader"
date: 2026-07-10
---
# Adding a New Language Keyboard to KOReader

A guide for adding native keyboard layouts to KOReader (tested on 2026.03 / Kobo Clara), based on adding an Azerbaijani layout. Use this as a template for any future language.

## Why you'd do this

KOReader ships with keyboards for many languages, but not all of them. If you're reading books/PDFs in a language without a native layout, you either:
- fall back to a keyboard that's *close but wrong* (e.g. using Turkish for Azerbaijani), or
- can't type the language's special characters into dictionary lookups, search, notes, etc.

The fix: add a proper layout as a small patch file, not a full rewrite.

## The key insight

**Don't write a keyboard from scratch.** Every non-English KOReader layout (see `tr_keyboard.lua`, etc.) is built by:

1. Loading `en_keyboard.lua` as a base
2. Rearranging/inserting keys on top of it
3. Returning the modified table

This means you inherit, for free:
- Shift / Symbol layers
- Long-press popups (accents, alternate characters)
- Key widths, spacing
- Globe key, Enter, spacebar, backspace

You only need to define what's *different* about your language.

## Files involved

| Purpose | Path |
|---|---|
| Keyboard layouts | `.adds/koreader/frontend/ui/data/keyboardlayouts/` |
| English base layout (reference) | `.../keyboardlayouts/en_keyboard.lua` |
| Popup/long-press definitions | `.../keyboardlayouts/keypopup/en_popup.lua` |
| Keyboard registration | `.adds/koreader/frontend/ui/widget/virtualkeyboard.lua` |
| Language name registration | `.adds/koreader/frontend/ui/language.lua` |

Find them on your device with:

```bash
find /Volumes/KOBOeReader/.adds/koreader/frontend/ui/data/keyboardlayouts -maxdepth 1 -iname "*.lua"
```

## Step-by-step

### 1. Understand the English base layout's structure

`en_keyboard.lua` returns a table like:

```lua
return {
    min_layer = 1,
    max_layer = 4,
    shiftmode_keys = { ... },
    symbolmode_keys = { ... },
    utf8mode_keys = { ... },
    keys = {
        -- Row 1: number row
        -- Row 2: Q W E R T Y U I O P   (10 keys)
        -- Row 3: A S D F G H J K L ,   (10 keys, last is punctuation)
        -- Row 4: [Shift] Z X C V B N M [Backspace]   (9 keys)
        -- Row 5: [Sym] [Globe] . [Space] ← → [Enter]
    },
}
```

Each key is a table of up to 4 entries corresponding to the 4 layers:

```
{ Regular, Shift, Symbol, Shift+Symbol }
```

A key can also have popup directions (long-press/swipe) as named fields:

```lua
{ "Ü", north = "ü" }
```

`north/south/east/west/northeast/...` map to swipe directions on that key for accented or alternate variants.

### 2. Plan your visible layout

Sketch it out first, letter by letter, e.g.:

```
Q W E R T Y U I O P Ü
A S D F G H J K L I Ə
Z X C V B N M Ç Ş Ö
```

Decide:
- Which English letters are simply replaced/reused as-is
- Which new letters need brand-new keys, and *where* they go
- Which letters pair naturally as Regular/Shift (e.g. `ç`/`Ç`) vs need their own key entirely

### 3. Write the patch file

Create `xx_keyboard.lua` (use the language's ISO 639-1 code) in the `keyboardlayouts/` folder:

```lua
local xx_keyboard =
    dofile("frontend/ui/data/keyboardlayouts/en_keyboard.lua")

local keys = xx_keyboard.keys

-- Insert a new key into a row at a specific position.
-- table.insert automatically shifts everything after it right,
-- so existing keys (e.g. the comma key) move over safely.
table.insert(keys[3], 10,
    { { "Ə", north = "ə", }, { "ə", north = "Ə", }, "Ə", "ə", }
)

-- Replace an existing key entirely (e.g. swap English "I" for
-- a language-specific dotless/dotted pair):
keys[2][8][1] = { "I", north = "ı" }
keys[2][8][2] = { "ı", north = "I" }

-- Optional: translate the spacebar label
keys[5][4].label = "boşluq"

return xx_keyboard
```

**Tips:**
- Always `table.insert` rather than overwrite when adding new keys, so you don't clobber existing punctuation keys — they'll just get pushed further along the row.
- Reuse `north =` (and `south`/`east`/`west`/etc.) for the uppercase/lowercase counterpart or an accented variant, matching how the rest of KOReader handles long-press.
- If a language has a distinctive currency symbol, it's a nice (optional) touch to add it to the number row, the way `tr_keyboard.lua` adds ₺.

### 4. Register the language name

In `frontend/ui/language.lua`, find `language_names = {` and add:

```lua
xx = "Native Language Name",
```

### 5. Register the keyboard layout

In `frontend/ui/widget/virtualkeyboard.lua`, find `lang_to_keyboard_layout = {` and add:

```lua
xx = "xx_keyboard",
```

### 6. Test on-device

Copy `xx_keyboard.lua` to:

```
.adds/koreader/frontend/ui/data/keyboardlayouts/
```

Restart KOReader, switch to the new language via the keyboard's globe/language switcher, and check:
- All new letters appear where expected
- Shift produces correct uppercase
- Long-press/swipe popups work
- Nothing from the original English layout (punctuation, numbers, Enter, etc.) got lost or overlapped

### 7. (Optional) Validate the Lua syntax before copying to device

If you have Lua installed locally (or in a sandbox), you can sanity-check the file loads without errors before putting it on the Kobo:

```bash
lua5.3 -e '
local ok, kb = pcall(dofile, "path/to/keyboardlayouts/xx_keyboard.lua")
if not ok then print("LOAD ERROR:", kb) else print("Loaded OK, rows:", #kb.keys) end
'
```

This needs local copies of `en_keyboard.lua` and `keypopup/en_popup.lua` in the same relative folder structure, since `xx_keyboard.lua` `dofile`s them by relative path.

## Reference: rows in `en_keyboard.lua`

| Row index | Contents | Key count |
|---|---|---|
| `keys[1]` | Numbers | 10 |
| `keys[2]` | Q W E R T Y U I O P | 10 |
| `keys[3]` | A S D F G H J K L , | 10 |
| `keys[4]` | Shift, Z X C V B N M, Backspace | 9 |
| `keys[5]` | Sym, Globe, period, Space, ←, →, Enter | 7 |

## Worked example: Azerbaijani

See `az_keyboard.lua` — adds `Ü`, `Ə`, `ı`, `Ç`, `Ş`, `Ö` on top of the English base, inserting new keys into rows 2–4 rather than rewriting them, following exactly the pattern above.