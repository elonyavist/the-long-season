import type { PlayerId } from "@game/domain";

/*
 * Internal to team selection and deliberately not re-exported by the package
 * entrypoint. Nothing outside the selector should be able to assign an eleven
 * without going through the football policy that scores one.
 */

/**
 * One player already measured against one formation slot.
 *
 * The Module never scores a footballer itself. Scoring is football policy and it
 * belongs to the selector; this file only decides who ends up where once every
 * fit has been measured, so the two concerns cannot quietly influence each other.
 */
export interface FootballXiSlotCandidate {
  /** Player who may fill this slot. */
  readonly playerId: PlayerId;
  /** Selection score on the shared scale, higher being the better footballer here. */
  readonly score: number;
  /** Position of this candidate in the slot's canonical order, best first. */
  readonly rank: number;
}

/** Input for assigning one complete starting eleven. */
export interface AssignFootballXiInput {
  /**
   * Usable candidates per formation slot, in canonical slot order.
   *
   * A candidate the club cannot field in that slot is simply absent. The
   * assignment therefore never has to weigh an impossible pairing against a real
   * one, which is what a large negative score would ask it to do.
   */
  readonly candidatesBySlot: readonly (readonly FootballXiSlotCandidate[])[];
}

/** One complete assignment of footballers to formation slots. */
export interface FootballXiAssignment {
  /** Chosen candidate per slot, in the order the slots were supplied. */
  readonly candidateBySlot: readonly FootballXiSlotCandidate[];
  /** Sum of the chosen candidates' scores. */
  readonly totalScore: number;
}

/**
 * Assigns footballers to formation slots so the whole eleven is the best one.
 *
 * The obvious approach - walk the slots and give each one its best remaining
 * player - is what this replaces, because it answers a different question. It
 * asks "who is the best right back", when the shape needs "which eleven is the
 * best team". Those separate as soon as one footballer is credible in two slots:
 * a centre back who can also play right back is taken by whichever slot is
 * considered first, and the other slot then takes a specialist out of position.
 * On the measured Step 09 counterexample that cost `5.9` points of team quality,
 * with a right back playing centre back for no reason at all.
 *
 * The assignment is a minimum-cost maximum-flow over slots and players, so it
 * fills as many slots as can possibly be filled first and only then maximizes
 * football quality. Filling the shape is not tradeable against quality: an
 * eleven with a hole in it is not a team, whatever the other ten are worth.
 *
 * Ties are broken by candidate rank, summed across the eleven, so two footballers
 * who score identically resolve to the one his slot already prefers rather than
 * to whichever the search reached first.
 *
 * @example
 * const assignment = assignFootballXi({
 *   candidatesBySlot: formation.slots.map((slot) => rankedCandidatesFor(slot)),
 * });
 * // undefined when no complete eleven exists for this shape.
 */
export function assignFootballXi(input: AssignFootballXiInput): FootballXiAssignment | undefined {
  const slotCount = input.candidatesBySlot.length;
  if (slotCount === 0) {
    return undefined;
  }

  const playerIndexById = new Map<PlayerId, number>();
  for (const candidates of input.candidatesBySlot) {
    for (const candidate of candidates) {
      if (!playerIndexById.has(candidate.playerId)) {
        playerIndexById.set(candidate.playerId, playerIndexById.size);
      }
    }
  }

  const playerCount = playerIndexById.size;
  if (playerCount < slotCount) {
    return undefined;
  }

  const network = buildAssignmentNetwork(input.candidatesBySlot, playerIndexById, slotCount, playerCount);
  const filledSlotCount = pushMinimumCostFlow(network, slotCount);
  if (filledSlotCount < slotCount) {
    return undefined;
  }

  return readAssignment(network, input.candidatesBySlot, slotCount);
}

/**
 * Weight of one score point relative to the rank tie-break.
 *
 * Rank contributes at most `playerCount` per slot, so scaling score by more than
 * the largest possible total rank contribution makes any real quality difference
 * outrank every tie-break at once. The tie-break can then only choose between
 * elevens that are genuinely worth the same.
 */
function scoreWeight(slotCount: number, playerCount: number): number {
  return slotCount * playerCount + 1;
}

/** Directed residual edge in the assignment network. */
interface AssignmentEdge {
  readonly to: number;
  readonly reverseIndex: number;
  capacity: number;
  readonly cost: number;
  /** Candidate this edge represents, present only on slot-to-player edges. */
  readonly slotIndex?: number;
  readonly candidateIndex?: number;
}

interface AssignmentNetwork {
  readonly edgesByNode: readonly AssignmentEdge[][];
  readonly source: number;
  readonly sink: number;
  readonly nodeCount: number;
}

function buildAssignmentNetwork(
  candidatesBySlot: readonly (readonly FootballXiSlotCandidate[])[],
  playerIndexById: ReadonlyMap<PlayerId, number>,
  slotCount: number,
  playerCount: number,
): AssignmentNetwork {
  const source = 0;
  const firstSlotNode = 1;
  const firstPlayerNode = firstSlotNode + slotCount;
  const sink = firstPlayerNode + playerCount;
  const nodeCount = sink + 1;
  const edgesByNode: AssignmentEdge[][] = Array.from({ length: nodeCount }, () => []);
  const weight = scoreWeight(slotCount, playerCount);

  const addEdge = (from: number, to: number, cost: number, candidate?: {
    readonly slotIndex: number;
    readonly candidateIndex: number;
  }): void => {
    const forward: AssignmentEdge = {
      to,
      reverseIndex: edgesByNode[to]?.length ?? 0,
      capacity: 1,
      cost,
      ...(candidate ?? {}),
    };
    const backward: AssignmentEdge = {
      to: from,
      reverseIndex: edgesByNode[from]?.length ?? 0,
      capacity: 0,
      cost: -cost,
    };
    edgesByNode[from]?.push(forward);
    edgesByNode[to]?.push(backward);
  };

  for (const [slotIndex, candidates] of candidatesBySlot.entries()) {
    addEdge(source, firstSlotNode + slotIndex, 0);

    for (const [candidateIndex, candidate] of candidates.entries()) {
      const playerIndex = playerIndexById.get(candidate.playerId) ?? 0;
      // Higher score and better rank both mean lower cost, so the cheapest flow
      // is the best eleven. Rank is inverted so that rank `0` - the candidate
      // this slot already prefers - contributes the largest reduction.
      const cost = -(Math.round(candidate.score * 100) * weight + (playerCount - candidate.rank));
      addEdge(firstSlotNode + slotIndex, firstPlayerNode + playerIndex, cost, { slotIndex, candidateIndex });
    }
  }

  for (let playerIndex = 0; playerIndex < playerCount; playerIndex += 1) {
    addEdge(firstPlayerNode + playerIndex, sink, 0);
  }

  return { edgesByNode, source, sink, nodeCount };
}

/**
 * Sends one unit of flow per slot along successive cheapest augmenting paths.
 *
 * Costs are negative by construction, so the shortest path is found with a
 * queue-based Bellman-Ford rather than Dijkstra. The graph has one node per slot
 * and per player, which is small enough that the simpler algorithm is also the
 * faster one in practice.
 */
function pushMinimumCostFlow(network: AssignmentNetwork, slotCount: number): number {
  let pushedFlow = 0;

  for (let augmentation = 0; augmentation < slotCount; augmentation += 1) {
    const path = findCheapestAugmentingPath(network);
    if (path === undefined) {
      return pushedFlow;
    }

    for (const { node, edgeIndex } of path) {
      const edge = network.edgesByNode[node]?.[edgeIndex];
      if (edge === undefined) continue;
      edge.capacity -= 1;
      const reverse = network.edgesByNode[edge.to]?.[edge.reverseIndex];
      if (reverse !== undefined) reverse.capacity += 1;
    }

    pushedFlow += 1;
  }

  return pushedFlow;
}

interface AugmentingPathStep {
  readonly node: number;
  readonly edgeIndex: number;
}

function findCheapestAugmentingPath(network: AssignmentNetwork): readonly AugmentingPathStep[] | undefined {
  const distances = new Array<number>(network.nodeCount).fill(Number.POSITIVE_INFINITY);
  const previous = new Array<AugmentingPathStep | undefined>(network.nodeCount).fill(undefined);
  const queued = new Array<boolean>(network.nodeCount).fill(false);
  const queue: number[] = [network.source];

  distances[network.source] = 0;
  queued[network.source] = true;

  for (let head = 0; head < queue.length; head += 1) {
    const node = queue[head];
    if (node === undefined) continue;
    queued[node] = false;
    const nodeDistance = distances[node] ?? Number.POSITIVE_INFINITY;

    for (const [edgeIndex, edge] of (network.edgesByNode[node] ?? []).entries()) {
      if (edge.capacity <= 0) continue;
      const candidateDistance = nodeDistance + edge.cost;
      if (candidateDistance >= (distances[edge.to] ?? Number.POSITIVE_INFINITY)) continue;

      distances[edge.to] = candidateDistance;
      previous[edge.to] = { node, edgeIndex };
      if (queued[edge.to] !== true) {
        queued[edge.to] = true;
        queue.push(edge.to);
      }
    }
  }

  if (distances[network.sink] === Number.POSITIVE_INFINITY) {
    return undefined;
  }

  const path: AugmentingPathStep[] = [];
  let node = network.sink;
  while (node !== network.source) {
    const step = previous[node];
    if (step === undefined) return undefined;
    path.push(step);
    node = step.node;
  }

  return path;
}

function readAssignment(
  network: AssignmentNetwork,
  candidatesBySlot: readonly (readonly FootballXiSlotCandidate[])[],
  slotCount: number,
): FootballXiAssignment | undefined {
  const candidateBySlot = new Array<FootballXiSlotCandidate | undefined>(slotCount).fill(undefined);

  for (const edges of network.edgesByNode) {
    for (const edge of edges) {
      if (edge.slotIndex === undefined || edge.candidateIndex === undefined || edge.capacity !== 0) continue;
      candidateBySlot[edge.slotIndex] = candidatesBySlot[edge.slotIndex]?.[edge.candidateIndex];
    }
  }

  const chosen: FootballXiSlotCandidate[] = [];
  for (const candidate of candidateBySlot) {
    if (candidate === undefined) return undefined;
    chosen.push(candidate);
  }

  return {
    candidateBySlot: chosen,
    totalScore: chosen.reduce((total, candidate) => total + candidate.score, 0),
  };
}
