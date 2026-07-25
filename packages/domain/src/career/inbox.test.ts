import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerContractId, playerId } from "../types/ids.ts";
import { gameDate } from "../value-objects/game-date.ts";
import { contractNegotiationId } from "./contract-negotiation.ts";
import { preliminaryAgreementId } from "./preliminary-agreement.ts";
import { transferNegotiationId } from "./transfer-negotiation.ts";
import {
  careerInboxMessageId,
  createCareerInboxMessage,
  doesCareerInboxMessageStopContinue,
  type CareerInboxMessageInput,
} from "./inbox.ts";

const baseMessage: CareerInboxMessageInput = {
  id: careerInboxMessageId("inbox:matchday:fixture:000003"),
  date: gameDate(20_000),
  category: "matchday",
  source: "technical_staff",
  level: "blocking",
  lifecycle: { read: false, acknowledged: false, resolved: false },
  related: { fixtureId: fixtureId("fixture:000003") },
  blockerKeys: ["missing_saved_lineup"],
  actionIds: ["prepare_match"],
};

test("careerInboxMessageId validates namespaced message IDs", () => {
  assert.equal(careerInboxMessageId("inbox:matchday:fixture:000003"), "inbox:matchday:fixture:000003");
  assert.throws(() => careerInboxMessageId(""), /must not be empty/);
  assert.throws(() => careerInboxMessageId("42"), /integer-like/);
  assert.throws(() => careerInboxMessageId("message:fixture-000003"), /inbox:/);
  assert.throws(() => careerInboxMessageId("inbox:"), /include a value/);
});

test("message remains structured and keeps lifecycle facts independent", () => {
  const message = createCareerInboxMessage(baseMessage);

  assert.equal(message.category, "matchday");
  assert.equal(message.source, "technical_staff");
  assert.equal(message.level, "blocking");
  assert.deepEqual(message.lifecycle, { read: false, acknowledged: false, resolved: false });
  assert.deepEqual(message.blockerKeys, ["missing_saved_lineup"]);
});

test("acknowledgement requires a read important message", () => {
  assert.throws(
    () =>
      createCareerInboxMessage({
        ...baseMessage,
        level: "important",
        lifecycle: { read: false, acknowledged: true, resolved: false },
      }),
    /must also be read/,
  );
  assert.throws(
    () =>
      createCareerInboxMessage({
        ...baseMessage,
        lifecycle: { read: true, acknowledged: true, resolved: false },
      }),
    /Only important/,
  );
});

test("unresolved blocking messages require an action and a fixture", () => {
  assert.throws(() => createCareerInboxMessage({ ...baseMessage, actionIds: [] }), /must expose an action/);
  assert.throws(() => createCareerInboxMessage({ ...baseMessage, related: {} }), /reference a fixture/);
});

test("workflow categories require their stable functional source and related facts", () => {
  assert.throws(
    () => createCareerInboxMessage({ ...baseMessage, category: "match_result" }),
    /source match_report/,
  );
  assert.throws(
    () => createCareerInboxMessage({
      ...baseMessage,
      category: "season_rollover",
      source: "competition_office",
      related: {},
      level: "important",
      actionIds: [],
    }),
    /selected club/,
  );

  const result = createCareerInboxMessage({
    ...baseMessage,
    category: "match_result",
    source: "match_report",
    level: "informational",
    actionIds: [],
  });
  const rollover = createCareerInboxMessage({
    ...baseMessage,
    category: "season_rollover",
    source: "competition_office",
    level: "important",
    related: { clubId: clubId("club:selected") },
    actionIds: [],
  });

  assert.equal(result.category, "match_result");
  assert.equal(rollover.category, "season_rollover");
});

test("Continue stops for unresolved blocking and unacknowledged important messages only", () => {
  const blocking = createCareerInboxMessage(baseMessage);
  const resolved = createCareerInboxMessage({
    ...baseMessage,
    lifecycle: { read: true, acknowledged: false, resolved: true },
  });
  const important = createCareerInboxMessage({
    ...baseMessage,
    level: "important",
    lifecycle: { read: true, acknowledged: false, resolved: false },
  });
  const acknowledged = createCareerInboxMessage({
    ...baseMessage,
    level: "important",
    lifecycle: { read: true, acknowledged: true, resolved: false },
  });
  const informational = createCareerInboxMessage({
    ...baseMessage,
    level: "informational",
    lifecycle: { read: false, acknowledged: false, resolved: false },
    actionIds: [],
  });

  assert.equal(doesCareerInboxMessageStopContinue(blocking), true);
  assert.equal(doesCareerInboxMessageStopContinue(resolved), false);
  assert.equal(doesCareerInboxMessageStopContinue(important), true);
  assert.equal(doesCareerInboxMessageStopContinue(acknowledged), false);
  assert.equal(doesCareerInboxMessageStopContinue(informational), false);
});

test("contract reminders remain visible without stopping Continue", () => {
  const reminder = createCareerInboxMessage({
    id: careerInboxMessageId("inbox:contract-reminder:contract-01"),
    date: gameDate(20_000),
    category: "contract_reminder",
    source: "contract_office",
    level: "important",
    continuePolicy: "never",
    lifecycle: { read: false, acknowledged: false, resolved: false },
    related: {
      clubId: clubId("club:selected"),
      playerId: playerId("player:contract-01"),
      contractId: playerContractId("contract:contract-01"),
    },
    actionIds: ["open_contract_negotiation"],
  });

  assert.equal(reminder.continuePolicy, "never");
  assert.equal(doesCareerInboxMessageStopContinue(reminder), false);
});

test("contract responses require a stable negotiation reference", () => {
  const contractRelated = {
    contractId: playerContractId("contract:contract-02"),
  };

  assert.throws(
    () => createCareerInboxMessage({
      id: careerInboxMessageId("inbox:contract-counteroffer:missing-negotiation"),
      date: gameDate(20_000),
      category: "contract_counteroffer",
      source: "contract_office",
      level: "blocking",
      lifecycle: { read: false, acknowledged: false, resolved: false },
      related: contractRelated,
      actionIds: ["open_contract_negotiation"],
    }),
    /contract negotiation/,
  );

  const counter = createCareerInboxMessage({
    id: careerInboxMessageId("inbox:contract-counteroffer:contract-02"),
    date: gameDate(20_000),
    category: "contract_counteroffer",
    source: "contract_office",
    level: "blocking",
    lifecycle: { read: false, acknowledged: false, resolved: false },
    related: {
      ...contractRelated,
      contractNegotiationId: contractNegotiationId("contract-negotiation:contract-02"),
    },
    actionIds: ["open_contract_negotiation"],
  });

  assert.equal(doesCareerInboxMessageStopContinue(counter), true);
});

test("diagnosis and suspension messages carry player facts without fake actions", () => {
  const related = { fixtureId: fixtureId("fixture:inbox-01"), playerId: playerId("player:inbox-01") };
  const diagnosis = createCareerInboxMessage({
    id: careerInboxMessageId("inbox:diagnosis:01"),
    date: gameDate(20_001),
    category: "injury_diagnosis",
    source: "medical_team",
    level: "important",
    lifecycle: { read: false, acknowledged: false, resolved: false },
    related,
  });
  const suspension = createCareerInboxMessage({
    id: careerInboxMessageId("inbox:suspension:01"),
    date: gameDate(20_001),
    category: "suspension",
    source: "competition_office",
    level: "important",
    lifecycle: { read: false, acknowledged: false, resolved: false },
    related,
  });

  assert.deepEqual(diagnosis.actionIds, []);
  assert.deepEqual(suspension.blockerKeys, []);
});

test("market messages require a market identity, a player, and the transfer office", () => {
  const marketRelated = {
    playerId: playerId("player:inbox-market-01"),
    transferNegotiationId: transferNegotiationId("transfer-negotiation:inbox-market-01"),
  };

  assert.throws(
    () => createCareerInboxMessage({
      id: careerInboxMessageId("inbox:market-club-counteroffer:missing-identity"),
      date: gameDate(20_000),
      category: "market_club_counteroffer",
      source: "transfer_office",
      level: "blocking",
      lifecycle: { read: false, acknowledged: false, resolved: false },
      related: { playerId: playerId("player:inbox-market-01") },
      actionIds: ["open_market_negotiation"],
    }),
    /transfer negotiation or preliminary agreement/,
  );

  assert.throws(
    () => createCareerInboxMessage({
      id: careerInboxMessageId("inbox:market-club-counteroffer:missing-player"),
      date: gameDate(20_000),
      category: "market_club_counteroffer",
      source: "transfer_office",
      level: "blocking",
      lifecycle: { read: false, acknowledged: false, resolved: false },
      related: { transferNegotiationId: transferNegotiationId("transfer-negotiation:inbox-market-01") },
      actionIds: ["open_market_negotiation"],
    }),
    /must reference a player/,
  );

  assert.throws(
    () => createCareerInboxMessage({
      id: careerInboxMessageId("inbox:market-club-counteroffer:wrong-source"),
      date: gameDate(20_000),
      category: "market_club_counteroffer",
      source: "contract_office",
      level: "blocking",
      lifecycle: { read: false, acknowledged: false, resolved: false },
      related: marketRelated,
      actionIds: ["open_market_negotiation"],
    }),
    /transfer_office/,
  );

  const counter = createCareerInboxMessage({
    id: careerInboxMessageId("inbox:market-club-counteroffer:inbox-market-01"),
    date: gameDate(20_000),
    category: "market_club_counteroffer",
    source: "transfer_office",
    level: "blocking",
    lifecycle: { read: false, acknowledged: false, resolved: false },
    related: marketRelated,
    actionIds: ["open_market_negotiation"],
  });
  assert.equal(doesCareerInboxMessageStopContinue(counter), true);

  const activated = createCareerInboxMessage({
    id: careerInboxMessageId("inbox:market-preliminary-activated:inbox-market-02"),
    date: gameDate(20_000),
    category: "market_preliminary_activated",
    source: "transfer_office",
    level: "important",
    continuePolicy: "until_acknowledged",
    lifecycle: { read: false, acknowledged: false, resolved: true },
    related: {
      playerId: playerId("player:inbox-market-02"),
      preliminaryAgreementId: preliminaryAgreementId("preliminary-agreement:inbox-market-02"),
    },
  });
  assert.equal(doesCareerInboxMessageStopContinue(activated), true);

  const withdrawn = createCareerInboxMessage({
    id: careerInboxMessageId("inbox:market-offer-withdrawn:inbox-market-01"),
    date: gameDate(20_000),
    category: "market_offer_withdrawn",
    source: "transfer_office",
    level: "informational",
    lifecycle: { read: false, acknowledged: false, resolved: true },
    related: marketRelated,
  });
  assert.equal(doesCareerInboxMessageStopContinue(withdrawn), false);
});
