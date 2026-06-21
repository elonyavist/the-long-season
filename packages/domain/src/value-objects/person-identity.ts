/** Stable country/nationality keys used by generated fictional content. */
export const NATIONALITY_CODES = [
  "italian",
  "english",
  "spanish",
  "german",
  "french",
  "portuguese",
  "brazilian",
  "argentinian",
  "colombian",
  "mexican",
  "dutch",
  "welsh",
  "scottish",
  "croatian",
  "serbian",
  "albanian",
  "russian",
  "turkish",
  "polish",
  "nigerian",
  "senegalese",
  "ghanaian",
  "ivorian",
  "moroccan",
  "american",
  "japanese",
  "south_korean",
] as const;

/** Country/nationality key stored as language-agnostic domain data. */
export type NationalityCode = (typeof NATIONALITY_CODES)[number];

/** Stable keys for fictional name pools owned by content packages. */
export const NAME_CULTURE_KEYS = [
  "italian",
  "english",
  "spanish",
  "german",
  "french",
  "portuguese",
  "brazilian",
  "spanish_american",
  "dutch",
  "balkan",
  "central_eastern_european",
  "west_african",
  "north_african",
  "turkish",
  "american",
  "japanese",
  "korean",
] as const;

/** Name-culture key used to select deterministic fictional first/last names. */
export type NameCultureKey = (typeof NAME_CULTURE_KEYS)[number];

/**
 * Reusable identity for fictional football people.
 *
 * Names are authored or generated content, not localization labels. Presentation
 * layers may localize labels around a person, but must not translate these
 * generated names.
 */
export interface PersonIdentity {
  /** Generated or authored given name. */
  readonly firstName: string;
  /** Generated or authored family name. */
  readonly lastName: string;
  /** Primary football nationality. */
  readonly nationality: NationalityCode;
  /** Optional second nationality for future eligibility and flavor systems. */
  readonly secondNationality?: NationalityCode;
  /** Birth country key, usually equal to nationality for early generated content. */
  readonly birthCountry: NationalityCode;
  /** Name-culture key used by content name pools. */
  readonly nameCulture: NameCultureKey;
}

/** Input accepted by the identity constructor. */
export type PersonIdentityInput = PersonIdentity;

/** Machine-readable person-identity validation failure. */
export type PersonIdentityErrorCode =
  | "empty_first_name"
  | "empty_last_name"
  | "unsupported_nationality"
  | "unsupported_second_nationality"
  | "duplicate_second_nationality"
  | "unsupported_birth_country"
  | "unsupported_name_culture"
  | "unexpected_identity_field";

/** Error thrown when fictional person identity data is invalid. */
export class PersonIdentityError extends Error {
  /** Stable machine-readable validation code. */
  public readonly code: PersonIdentityErrorCode;

  /** Creates a person-identity validation error. */
  public constructor(code: PersonIdentityErrorCode, message: string) {
    super(message);
    this.name = "PersonIdentityError";
    this.code = code;
  }
}

/**
 * Builds a validated fictional person identity.
 *
 * @example
 * const identity = createPersonIdentity({
 *   firstName: "Luca",
 *   lastName: "Ferri",
 *   nationality: "italian",
 *   birthCountry: "italian",
 *   nameCulture: "italian",
 * });
 */
export function createPersonIdentity(input: PersonIdentityInput): PersonIdentity {
  assertNoUnexpectedIdentityFields(input);

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  if (firstName.length === 0) {
    throw new PersonIdentityError("empty_first_name", "Person first name must not be empty");
  }

  if (lastName.length === 0) {
    throw new PersonIdentityError("empty_last_name", "Person last name must not be empty");
  }

  if (!isNationalityCode(input.nationality)) {
    throw new PersonIdentityError("unsupported_nationality", `Unsupported nationality: ${String(input.nationality)}`);
  }

  if (input.secondNationality !== undefined && !isNationalityCode(input.secondNationality)) {
    throw new PersonIdentityError(
      "unsupported_second_nationality",
      `Unsupported second nationality: ${String(input.secondNationality)}`,
    );
  }

  if (input.secondNationality !== undefined && input.secondNationality === input.nationality) {
    throw new PersonIdentityError(
      "duplicate_second_nationality",
      `Second nationality must differ from primary nationality: ${input.nationality}`,
    );
  }

  if (!isNationalityCode(input.birthCountry)) {
    throw new PersonIdentityError("unsupported_birth_country", `Unsupported birth country: ${String(input.birthCountry)}`);
  }

  if (!isNameCultureKey(input.nameCulture)) {
    throw new PersonIdentityError("unsupported_name_culture", `Unsupported name culture: ${String(input.nameCulture)}`);
  }

  return {
    firstName,
    lastName,
    nationality: input.nationality,
    ...(input.secondNationality === undefined ? {} : { secondNationality: input.secondNationality }),
    birthCountry: input.birthCountry,
    nameCulture: input.nameCulture,
  };
}

/**
 * Narrows an arbitrary value to a supported nationality code.
 */
export function isNationalityCode(value: unknown): value is NationalityCode {
  return typeof value === "string" && NATIONALITY_CODE_SET.has(value);
}

/**
 * Narrows an arbitrary value to a supported name-culture key.
 */
export function isNameCultureKey(value: unknown): value is NameCultureKey {
  return typeof value === "string" && NAME_CULTURE_KEY_SET.has(value);
}

const NATIONALITY_CODE_SET: ReadonlySet<string> = new Set(NATIONALITY_CODES);
const NAME_CULTURE_KEY_SET: ReadonlySet<string> = new Set(NAME_CULTURE_KEYS);
const PERSON_IDENTITY_FIELDS: ReadonlySet<string> = new Set([
  "firstName",
  "lastName",
  "nationality",
  "secondNationality",
  "birthCountry",
  "nameCulture",
]);

function assertNoUnexpectedIdentityFields(input: PersonIdentityInput): void {
  for (const key in input) {
    if (!PERSON_IDENTITY_FIELDS.has(key)) {
      throw new PersonIdentityError("unexpected_identity_field", `Unexpected identity field: ${key}`);
    }
  }
}
