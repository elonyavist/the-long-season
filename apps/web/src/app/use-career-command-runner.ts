import type { MessageKey } from "@game/i18n";
import { useMemo } from "react";

import {
  classifyWebCareerPersistenceFailure,
  type WebCareerPersistenceFailure,
} from "../runtime/web-career-runtime";
import {
  useCareerUiStore,
  type CareerCommandId,
  type CareerStorageFailureScope,
} from "../stores/career-ui-store";

/** One real asynchronous command executed through the career mutation lock. */
export interface CareerCommandRequest<T> {
  readonly commandId: CareerCommandId;
  readonly statusLabelKey: MessageKey;
  readonly failureScope: CareerStorageFailureScope;
  readonly execute: () => Promise<T>;
  readonly onSuccess: (result: T) => void;
}

/** Minimal observable actions required by the command runner. */
export interface CareerCommandRunnerDependencies {
  readonly begin: (commandId: CareerCommandId, statusLabelKey: MessageKey) => boolean;
  readonly complete: (commandId: CareerCommandId) => void;
  readonly fail: (commandId: CareerCommandId, failure: WebCareerPersistenceFailure) => void;
  readonly exposeFailure: (
    failure: WebCareerPersistenceFailure,
    scope: CareerStorageFailureScope,
  ) => void;
}

/** Return type used by event handlers and tests to observe duplicate rejection. */
export type CareerCommandRunner = <T>(request: CareerCommandRequest<T>) => Promise<boolean>;

/**
 * Creates one small Promise runner with a synchronous mutation lock.
 *
 * The success callback publishes the new session snapshot before activity is
 * cleared. Failures remain bounded by the existing persistence vocabulary.
 */
export function createCareerCommandRunner(
  dependencies: CareerCommandRunnerDependencies,
): CareerCommandRunner {
  return async <T>(request: CareerCommandRequest<T>): Promise<boolean> => {
    if (!dependencies.begin(request.commandId, request.statusLabelKey)) return false;

    try {
      const result = await request.execute();
      request.onSuccess(result);
      dependencies.complete(request.commandId);
      return true;
    } catch (error: unknown) {
      const failure = classifyWebCareerPersistenceFailure(error);
      dependencies.fail(request.commandId, failure);
      dependencies.exposeFailure(failure, request.failureScope);
      return false;
    }
  };
}

/** Binds the canonical runner to the focused Zustand career UI adapter. */
export function useCareerCommandRunner(): CareerCommandRunner {
  const begin = useCareerUiStore((state) => state.beginCareerCommand);
  const complete = useCareerUiStore((state) => state.completeCareerCommand);
  const failCommand = useCareerUiStore((state) => state.failCareerCommand);
  const exposeFailure = useCareerUiStore((state) => state.failCareerStorage);

  return useMemo(() => createCareerCommandRunner({
    begin,
    complete,
    fail: (commandId, failure) => failCommand(commandId, failure.code),
    exposeFailure,
  }), [begin, complete, exposeFailure, failCommand]);
}
