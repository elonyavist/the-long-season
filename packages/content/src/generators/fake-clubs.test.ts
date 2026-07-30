import assert from "node:assert/strict";
import { test } from "vitest";

import {
  fakeClubId,
  generateFakeClubIdentities,
  generateFakeClubs,
  generatedFakeClubId,
} from "./fake-clubs.ts";
import { createFakeLeagueSystem } from "./league-system.ts";

/**
 * Fake club tests protect visible fictional identities while preserving stable
 * domain IDs used by saved games and deterministic simulation order.
 */

test("fake clubs preserve stable club IDs while replacing placeholder names", () => {
  const clubs = generateFakeClubs({ seed: "world-a" });
  const firstClubId = clubs.clubIds[0];

  assert.equal(firstClubId, fakeClubId(1));
  assert.equal(String(firstClubId), "club:province-01");
  assert.equal(clubs.clubs[0]?.name.includes("Province"), false);
  assert.equal(clubs.clubs[0]?.shortName, "PRO01");
});

test("same seed produces the same fictional club identities", () => {
  const first = generateFakeClubs({ seed: "stable-world" });
  const second = generateFakeClubs({ seed: "stable-world" });

  assert.deepEqual(
    first.clubs.map((club) => club.name),
    second.clubs.map((club) => club.name),
  );
});

test("multi-division namespaces keep club and roster identities globally unique", () => {
  const first = generateFakeClubs({
    seed: "domestic-world",
    category: "first_division",
    divisionLevel: "first_division",
    clubIdNamespace: "ita-1",
    playerIdNamespace: "ita-1",
    shortNamePrefix: "D1",
  });
  const third = generateFakeClubs({
    seed: "domestic-world",
    category: "third_division",
    divisionLevel: "third_division",
    clubIdNamespace: "ita-3",
    playerIdNamespace: "ita-3",
    shortNamePrefix: "D3",
    excludedNames: first.clubs.map((club) => club.name),
  });

  assert.equal(first.clubIds[0], generatedFakeClubId(1, "ita-1"));
  assert.equal(first.clubs[0]?.category, "first_division");
  assert.equal(third.clubs[0]?.category, "third_division");
  assert.equal(new Set([...first.clubIds, ...third.clubIds]).size, 36);
  assert.equal(new Set([...first.clubs, ...third.clubs].flatMap((club) => club.playerIds)).size, 36 * 22);
  assert.equal(new Set([...first.clubs, ...third.clubs].map((club) => club.name)).size, 36);
});

test("different seeds can produce different fictional club mixes", () => {
  const first = generateFakeClubs({ seed: "world-a" });
  const second = generateFakeClubs({ seed: "world-b" });

  assert.notDeepEqual(
    first.clubs.map((club) => club.name),
    second.clubs.map((club) => club.name),
  );
});

test("generated league avoids duplicate club names", () => {
  const clubs = generateFakeClubs({ seed: "duplicate-check" });
  const names = clubs.clubs.map((club) => club.name);

  assert.equal(new Set(names).size, names.length);
});

test("third-division identities mostly come from small or medium city pools", () => {
  const identities = generateFakeClubIdentities(18, {
    seed: "third-division-city-mix",
    country: "italy",
    divisionLevel: "third_division",
  });
  const provincialCount = identities.filter((identity) => identity.cityTier !== "large").length;

  assert.equal(provincialCount >= 15, true);
});

test("Italian club names use mixed country-style football patterns", () => {
  const sampledNames = ["world-a", "world-b", "world-c"].flatMap((seed) =>
    generateFakeClubs({ seed, country: "italy" }).clubs.map((club) => club.name)
  );
  const italianNamePattern =
    /^(?:(A\.C\.|S\.S\.|A\.S\.|U\.S\.|F\.C\.|A\.S\.D\.|Pro|Virtus|Real) [A-Za-z]+(?: [A-Za-z0-9]+)*|[A-Za-z]+(?: [A-Za-z0-9]+)* Calcio)$/;
  const nonItalianSuffixPattern = /\b(Athletic|Union|Sporting|Rovers|Town|Club|Rangers)$/;

  assert.equal(sampledNames.every((name) => italianNamePattern.test(name)), true);
  assert.equal(sampledNames.some((name) => / Calcio$/.test(name)), true);
  assert.equal(sampledNames.some((name) => /^(Pro|Virtus|Real) /.test(name)), true);
  assert.equal(sampledNames.some((name) => /^(A\.C\.|S\.S\.|A\.S\.|U\.S\.|F\.C\.|A\.S\.D\.) /.test(name)), true);
  assert.equal(sampledNames.some((name) => nonItalianSuffixPattern.test(name)), false);
});

test("supported countries use distinct football naming vocabularies", () => {
  const englishNames = generateFakeClubs({ seed: "country-style", country: "england" }).clubs.map((club) => club.name);
  const spanishNames = generateFakeClubs({ seed: "country-style", country: "spain" }).clubs.map((club) => club.name);
  const germanNames = generateFakeClubs({ seed: "country-style", country: "germany" }).clubs.map((club) => club.name);
  const frenchNames = generateFakeClubs({ seed: "country-style", country: "france" }).clubs.map((club) => club.name);

  assert.equal(englishNames.some((name) => /\b(United|Town|County|Rovers|Athletic|Albion|Wanderers|F\.C\.)$/.test(name)), true);
  assert.equal(spanishNames.some((name) => /^(Real|Atletico|Athletic|Sporting|Racing|Deportivo|C\.D\.|U\.D\.|A\.D\.) /.test(name) || / C\.F\.$/.test(name)), true);
  assert.equal(germanNames.some((name) => /^(F\.C\.|S\.C\.|S\.V\.|T\.S\.V\.|VfB|VfL|F\.S\.V\.|Fortuna|Dynamo) /.test(name)), true);
  assert.equal(frenchNames.some((name) => /^(F\.C\.|A\.S\.|R\.C\.|S\.C\.|U\.S\.|Stade|Olympique|Racing|Sporting) /.test(name)), true);
});

test("fake league passes the world seed into generated club names", () => {
  const first = createFakeLeagueSystem({ worldSeed: "club-world-a" });
  const second = createFakeLeagueSystem({ worldSeed: "club-world-b" });

  assert.equal(first.clubIds[0], second.clubIds[0]);
  assert.notDeepEqual(
    first.clubs.map((club) => club.name),
    second.clubs.map((club) => club.name),
  );
});
