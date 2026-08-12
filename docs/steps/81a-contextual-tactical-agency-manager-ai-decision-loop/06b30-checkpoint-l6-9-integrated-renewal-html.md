# Step 06B30 - Checkpoint L6.9 Integrated Renewal HTML

## Status

Planned - opens after L6.8 has an adopted product outcome.

## Goal

Run one current-product `7 x 10` canary through `simulation-report`, then render
the canonical artifact to a desktop English HTML file without recomputation.
It exposes standings, scorers, assists, player ages/minutes, formations,
transfers and generational renewal.

## Frozen Execution

- exactly `7` worlds, `10` seasons and `7` workers;
- fresh current-product cache and seed prefix distinct from analysis arms;
- JSON is canonical evidence; HTML uses `--from-report` and cannot simulate;
- output paths:
  `simulation-out/phase81a-integrated-renewal-l6-9-7x10.json` and
  `simulation-out/phase81a-integrated-renewal-l6-9-7x10.html`;
- zero fallback selection, missing IDs, reconciliation, unknown origin or
  product/CLI divergence.

The HTML remains desktop-only and English as explicitly accepted for this
private diagnostic view. No gameplay tuning occurs after seeing the canary.
