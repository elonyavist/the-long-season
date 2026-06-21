import assert from "node:assert/strict";
import { test } from "vitest";

import {
  createPersonIdentity,
  isNameCultureKey,
  isNationalityCode,
  PersonIdentityError,
} from "./person-identity.ts";

/** Tests the reusable fictional person identity contract. */

test("createPersonIdentity trims and returns language-agnostic identity data", () => {
  const identity = createPersonIdentity({
    firstName: " Luca ",
    lastName: " Ferri ",
    nationality: "italian",
    birthCountry: "italian",
    nameCulture: "italian",
  });

  assert.deepEqual(identity, {
    firstName: "Luca",
    lastName: "Ferri",
    nationality: "italian",
    birthCountry: "italian",
    nameCulture: "italian",
  });
});

test("createPersonIdentity accepts a different second nationality", () => {
  const identity = createPersonIdentity({
    firstName: "Mateo",
    lastName: "Rossi",
    nationality: "italian",
    secondNationality: "argentinian",
    birthCountry: "argentinian",
    nameCulture: "spanish_american",
  });

  assert.equal(identity.secondNationality, "argentinian");
});

test("createPersonIdentity rejects empty names", () => {
  assertIdentityError(
    {
      firstName: " ",
      lastName: "Ferri",
      nationality: "italian",
      birthCountry: "italian",
      nameCulture: "italian",
    },
    "empty_first_name",
  );

  assertIdentityError(
    {
      firstName: "Luca",
      lastName: "",
      nationality: "italian",
      birthCountry: "italian",
      nameCulture: "italian",
    },
    "empty_last_name",
  );
});

test("createPersonIdentity rejects unsupported nationality fields", () => {
  assertIdentityError(
    {
      firstName: "Luca",
      lastName: "Ferri",
      nationality: "unsupported",
      birthCountry: "italian",
      nameCulture: "italian",
    },
    "unsupported_nationality",
  );

  assertIdentityError(
    {
      firstName: "Luca",
      lastName: "Ferri",
      nationality: "italian",
      secondNationality: "unsupported",
      birthCountry: "italian",
      nameCulture: "italian",
    },
    "unsupported_second_nationality",
  );

  assertIdentityError(
    {
      firstName: "Luca",
      lastName: "Ferri",
      nationality: "italian",
      birthCountry: "unsupported",
      nameCulture: "italian",
    },
    "unsupported_birth_country",
  );
});

test("createPersonIdentity rejects duplicate second nationality", () => {
  assertIdentityError(
    {
      firstName: "Luca",
      lastName: "Ferri",
      nationality: "italian",
      secondNationality: "italian",
      birthCountry: "italian",
      nameCulture: "italian",
    },
    "duplicate_second_nationality",
  );
});

test("createPersonIdentity rejects unsupported name culture", () => {
  assertIdentityError(
    {
      firstName: "Luca",
      lastName: "Ferri",
      nationality: "italian",
      birthCountry: "italian",
      nameCulture: "unsupported",
    },
    "unsupported_name_culture",
  );
});

test("createPersonIdentity rejects rendered-prose identity fields", () => {
  assertIdentityError(
    {
      firstName: "Luca",
      lastName: "Ferri",
      nationality: "italian",
      birthCountry: "italian",
      nameCulture: "italian",
      displayName: "Luca Ferri",
    },
    "unexpected_identity_field",
  );
});

test("identity key guards narrow supported values", () => {
  assert.equal(isNationalityCode("italian"), true);
  assert.equal(isNationalityCode("unsupported"), false);
  assert.equal(isNameCultureKey("spanish_american"), true);
  assert.equal(isNameCultureKey("unsupported"), false);
});

function assertIdentityError(input: Record<string, unknown>, code: PersonIdentityError["code"]): void {
  assert.throws(
    () => createPersonIdentity(input as unknown as Parameters<typeof createPersonIdentity>[0]),
    (error: unknown) => error instanceof PersonIdentityError && error.code === code,
  );
}
