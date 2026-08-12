# Phase 81A - Checkpoint L6.20 Academy Prospect-Class Conversion

## Verdict

`OWNER_IDENTIFIED: routine_to_interesting_transition`.

## Population

- seven fresh current-product worlds, ten seasons, seven workers;
- accepted annual-academy players generated in seasons one through six;
- prospect class observed at content generation, filtered through canonical
  engine acceptance, never reconstructed from final players;
- season-ten conversion and leader floors from the canonical L6.15 joins.

All four classes appeared, 21 competition observations reconciled, and no
accepted player lost generation provenance.

## Result

### All divisions

| Class | Generated | Active S10 | Represented | Leaders | Below quality | Ceiling below |
|---|---:|---:|---:|---:|---:|---:|
| routine | 4,067 | 1,640 | 1,029 | 27 | 889 | 889 |
| interesting | 1,157 | 645 | 402 | 31 | 276 | 193 |
| serious | 371 | 216 | 136 | 14 | 70 | 50 |
| rare | 90 | 52 | 37 | 12 | 3 | 1 |

### First Division ceiling failures

| Class | Count | Share |
|---|---:|---:|
| routine | 355 | 0.7396 |
| interesting | 90 | 0.1875 |
| serious | 34 | 0.0708 |
| rare | 1 | 0.0021 |

Only `7.34%` of First-Division below-quality players had a sufficient stored
ceiling that was not realized. The missing renewal is therefore not primarily
development, minutes, serious-prospect frequency or rare/high-ceiling supply.

## Product Meaning

Annual academies create too many routine candidates for a ten-season world to
replace its leaders. Promoting a bounded top-flight share from routine to the
existing interesting class is the narrow owner: it changes neither total youth
volume nor the ceiling of any class. Lower divisions must stay unchanged so
their already healthier local relationship is not flattened.

## Reproduction

```bash
pnpm cli simulation-report \
  --profile=phase81a-academy-prospect-class-l6-20-7x10 \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-academy-prospect-class-l6-20-7x10.json
```

Artifact SHA-256:
`a997213fcee4fa2ba294c367e1b9ee6d70e75d3b4d40abcda0ca54f374f97e44`.
