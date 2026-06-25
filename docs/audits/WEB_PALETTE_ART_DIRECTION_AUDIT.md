# Web Palette Art Direction Audit

Date: 2026-06-24
Area: web UI theme palettes

## Reason

The current user-selectable palette feature is technically wired, but the
resulting screens do not yet feel like a premium retro football-management
game. The palettes pass basic render and contrast checks, but the visual system
looks decorative and inconsistent because the palette choices are not grounded
in a strong art direction.

This audit focuses on whether the colors improve the user experience and the
football-manager fantasy, not whether they merely satisfy mathematical contrast.

## External References Checked

- Football Manager 26 describes its reworked UI around cleaner presentation,
  information tiles, and cards that reveal more detail:
  https://www.footballmanager.com/fm26/features/fm26s-reimagined-user-interface
- The Football Manager skin ecosystem treats skins as complete layout and color
  systems, not isolated palette swaps:
  https://sortitoutsi.net/football-manager-2024-skins
- FM Scout skin descriptions repeatedly emphasize clean dark interfaces,
  consistent shades, and reduced decoration:
  https://www.fmscout.com/c-fm24-skins.html
- Championship Manager 01/02 screenshots show a dense, utilitarian,
  table-first, menu-structured interface:
  https://www.mobygames.com/game/5179/championship-manager-season-0102/screenshots/

## What Is Wrong

### 1. The palettes are skins in name only

The implementation changes background, panel, line, text, accent, and button
variables, but the UI still has the same surface hierarchy, spacing, shadows,
and table treatment. This makes the palette feel like a color filter over the
same screen instead of a real visual identity.

Impact: the user does not feel they selected a polished game skin. They see the
same screen recolored.

### 2. Too many palettes have weak genre meaning

The current set contains useful ideas, but several palettes are abstract:

- `violet-director` does not strongly belong to football management.
- `azzurri-office` is plausible but too close to generic teal software.
- `clubhouse-sage` reads soft and washed-out rather than managerial.
- `touchline-stone` is too neutral and risks looking like an admin product.

Impact: the game loses football identity. The user expects club office,
programme paper, floodlit night, dugout, press room, or archive desk, not random
UI color moods.

### 3. Light palettes are structurally fragile

The light palettes technically meet text contrast in many places, but the UI was
designed from a dark base. Some components still rely on dark-theme assumptions:

- dark table headers over light cards;
- soft shadows that look like dirt instead of depth;
- muted text and disabled states that become low-quality grey patches;
- pitch and bench remaining dark/green while the rest becomes paper-like.

Impact: the screen looks partially converted. This is the main reason it can
feel like a Paint mockup.

### 4. Accent contrast is not enough for premium feel

Measured contrast shows that text is generally readable, but accent-on-panel is
weak in several light palettes:

- `heritage-cream`: accent on panel around 3.01;
- `programme-ivory`: accent on panel around 3.44;
- `clubhouse-sage`: accent text on accent around 3.85.

This does not automatically fail every WCAG case because accent usage varies,
but it is a visual warning. Premium manager UI needs accents that feel deliberate
and legible, especially for action buttons and active navigation.

Impact: gold labels/buttons feel faded instead of authoritative.

### 5. Token names mix product semantics and color semantics

Tokens such as `paper`, `gold`, `scoreboard`, `clubhouse`, and `theme-accent`
are mixed across components. Some are semantic, some are color names, some are
surface names. This makes palette changes unpredictable.

Impact: changing a palette can accidentally recolor areas that should remain
stable, or leave old colors in places that should adapt.

### 6. Visual QA checks stability, not taste

The current browser QA checks:

- selected palette applied;
- no horizontal overflow;
- stable pitch grass;
- semantic red/green stay stable;
- screenshots are produced.

It does not fail a palette because it looks amateurish, has weak hierarchy, or
does not match the genre.

Impact: the pipeline can mark a bad visual result as acceptable.

## What Good Should Look Like

The game should have fewer, stronger palettes with explicit identity. Each
palette should be a full skin direction:

1. `Classic Manager Dark`
   - deep green/charcoal base;
   - warm paper text;
   - aged gold accent;
   - default.

2. `Floodlight Navy`
   - dark navy/ink base;
   - controlled gold action color;
   - crisp table contrast;
   - inspired by modern dark FM skins.

3. `Programme Paper`
   - warm off-white match programme feel;
   - dark ink text;
   - low-saturation gold;
   - light mode, but still dense and serious.

4. `Club Office`
   - muted green-grey or blue-grey office surface;
   - low-glare cards;
   - accent reserved for selected/primary actions.

5. `Press Room`
   - charcoal, slate, ivory;
   - restrained accent;
   - suitable for dashboard/news/inbox.

6. `Archive Sepia`
   - aged paper;
   - brown-black ink;
   - thin ruled borders;
   - only if the whole surface treatment is adapted.

Avoid:

- violet/purple unless tied to a club-specific skin later;
- random teal;
- pastel/sage softness;
- bright gold everywhere;
- palette counts that exist only to reach a number.

## Recommended Fix

Do not keep iterating by swapping hex values. The next phase should rework the
palette system as a visual identity system:

1. Reduce or replace the current 9 palettes with 6 strong skins.
2. Split tokens into clear groups:
   - app background;
   - shell surface;
   - panel surface;
   - table header;
   - table row;
   - table row selected;
   - border;
   - text;
   - muted text;
   - primary action;
   - primary action text;
   - focus ring.
3. Keep pitch, form, suitability, danger, and success outside palette themes.
4. For light themes, define light-specific surface rules instead of reusing dark
   component assumptions.
5. Add visual QA expectations that compare qualitative rules:
   - active navigation must be obvious but not neon;
   - table header must not look like an unrelated black block in light themes;
   - primary action must be readable and visibly primary;
   - muted text must remain secondary but not washed out;
   - selected row/state must be distinct without looking like a disabled row.
6. Keep screenshots for every skin, but mark visual acceptance manually in the
   audit until the style stabilizes.

## Product Decision

The current palettes should not be considered production-quality. They are a
technical foundation only.

Before building more web sections, the palette system should be corrected so
that the default visual identity is strong, and optional palettes feel like real
skins rather than cosmetic recolors.

