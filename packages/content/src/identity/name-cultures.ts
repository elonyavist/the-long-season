import { NAME_CULTURE_KEYS, type NameCultureKey } from "@game/domain";

/** Names available for one fictional name culture. */
export interface NameCulturePool {
  /** Stable culture key used by content generators. */
  readonly key: NameCultureKey;
  /** Fictional first-name entries for generated people. */
  readonly firstNames: readonly string[];
  /** Fictional last-name entries for generated people. */
  readonly lastNames: readonly string[];
}

/** Explicit deterministic order for name-culture pool review and tests. */
export const NAME_CULTURE_POOL_KEYS: readonly NameCultureKey[] = NAME_CULTURE_KEYS;

/** Content-owned fictional name pools, intentionally separate from i18n labels. */
export const NAME_CULTURE_POOLS: Readonly<Record<NameCultureKey, NameCulturePool>> = {
  italian: nameCulturePool("italian", ["Luca", "Matteo", "Davide", "Giorgio", "Nico", "Enrico"], [
    "Ferri",
    "Rinaldi",
    "Moretti",
    "Conti",
    "Bellini",
    "Ricciardi",
  ]),
  english: nameCulturePool("english", ["Oliver", "Ethan", "Callum", "Harry", "Mason", "Noah"], [
    "Bennett",
    "Carter",
    "Hughes",
    "Fletcher",
    "Turner",
    "Walsh",
  ]),
  spanish: nameCulturePool("spanish", ["Diego", "Iker", "Javier", "Raul", "Sergio", "Marcos"], [
    "Serrano",
    "Navarro",
    "Campos",
    "Molina",
    "Herrera",
    "Delgado",
  ]),
  german: nameCulturePool("german", ["Lukas", "Jonas", "Felix", "Timo", "Marvin", "Niklas"], [
    "Keller",
    "Bergmann",
    "Schuster",
    "Vogel",
    "Hartmann",
    "Weber",
  ]),
  french: nameCulturePool("french", ["Lucas", "Hugo", "Mathis", "Theo", "Nolan", "Adrien"], [
    "Moreau",
    "Lefevre",
    "Garnier",
    "Rousseau",
    "Mercier",
    "Dumont",
  ]),
  portuguese: nameCulturePool("portuguese", ["Tiago", "Ruben", "Andre", "Joao", "Miguel", "Nuno"], [
    "Ferreira",
    "Moreira",
    "Cardoso",
    "Pereira",
    "Barros",
    "Matos",
  ]),
  brazilian: nameCulturePool("brazilian", ["Caio", "Rafael", "Bruno", "Mateus", "Renan", "Vitor"], [
    "Santos",
    "Almeida",
    "Moraes",
    "Teixeira",
    "Barbosa",
    "Rezende",
  ]),
  spanish_american: nameCulturePool("spanish_american", ["Mateo", "Tomas", "Nicolas", "Emilio", "Facundo", "Lautaro"], [
    "Acosta",
    "Rojas",
    "Vargas",
    "Mendoza",
    "Paredes",
    "Sosa",
  ]),
  dutch: nameCulturePool("dutch", ["Daan", "Sem", "Milan", "Joris", "Luuk", "Bram"], [
    "Van Dalen",
    "De Wit",
    "Bakker",
    "Meijer",
    "Visser",
    "Jansen",
  ]),
  balkan: nameCulturePool("balkan", ["Luka", "Milan", "Nikola", "Marko", "Ivan", "Dario"], [
    "Petrovic",
    "Kovacic",
    "Markovic",
    "Jovanovic",
    "Stanic",
    "Radic",
  ]),
  central_eastern_european: nameCulturePool(
    "central_eastern_european",
    ["Jakub", "Marek", "Tomasz", "Adam", "Kamil", "Pavel"],
    ["Nowak", "Kowalski", "Zielinski", "Kral", "Horak", "Malik"],
  ),
  west_african: nameCulturePool("west_african", ["Moussa", "Ibrahima", "Amadou", "Sekou", "Yaya", "Oumar"], [
    "Diop",
    "Traore",
    "Sarr",
    "Camara",
    "Keita",
    "Diallo",
  ]),
  north_african: nameCulturePool("north_african", ["Youssef", "Karim", "Nabil", "Samir", "Adil", "Rayan"], [
    "Benali",
    "Haddad",
    "Mansouri",
    "Amrani",
    "El Idrissi",
    "Ziani",
  ]),
  turkish: nameCulturePool("turkish", ["Emir", "Arda", "Kerem", "Mert", "Can", "Yusuf"], [
    "Yilmaz",
    "Demir",
    "Kaya",
    "Celik",
    "Aydin",
    "Sahin",
  ]),
  american: nameCulturePool("american", ["Logan", "Tyler", "Austin", "Cameron", "Dylan", "Ryan"], [
    "Parker",
    "Brooks",
    "Reed",
    "Morgan",
    "Coleman",
    "Hayes",
  ]),
  japanese: nameCulturePool("japanese", ["Haruto", "Ren", "Sota", "Yuto", "Kaito", "Daichi"], [
    "Mori",
    "Ishikawa",
    "Nakano",
    "Fujita",
    "Kobayashi",
    "Tanaka",
  ]),
  korean: nameCulturePool("korean", ["Minjun", "Jiho", "Seojun", "Hyunwoo", "Jisung", "Taeyang"], [
    "Kim",
    "Lee",
    "Park",
    "Choi",
    "Jung",
    "Kang",
  ]),
};

/**
 * Retrieves the content-owned name pool for one culture key.
 */
export function getNameCulturePool(key: NameCultureKey): NameCulturePool {
  return NAME_CULTURE_POOLS[key];
}

function nameCulturePool(
  key: NameCultureKey,
  firstNames: readonly string[],
  lastNames: readonly string[],
): NameCulturePool {
  return {
    key,
    firstNames,
    lastNames,
  };
}
