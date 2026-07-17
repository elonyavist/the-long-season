import type { Translator } from "@game/i18n";
import type { ReactNode } from "react";

import {
  AppShellStorageRecoveryProvider,
} from "../features/app-shell/AppShell";
import {
  CareerSaveLifecycleProvider,
  type CareerSaveLifecycle,
} from "../features/app-shell/CareerSaveControl";
import {
  UnsavedCareerDialog,
  type UnsavedCareerDialogMode,
} from "../features/app-shell/UnsavedCareerDialog";
import type { WebCareerPersistenceFailure } from "../runtime/web-career-runtime";

/** Dirty-exit state and commands owned by the current career composition root. */
export type CareerExitDialogState = Readonly<{
  open: boolean;
  mode?: UnsavedCareerDialogMode;
  canSave: boolean;
  pending: boolean;
  text: Translator;
  onCancel: () => void;
  onExitWithoutSaving: () => void;
  onSaveAndExit: () => void;
}>;

/** Props for the bounded frame shared by every loaded-career screen. */
export type CareerAppFrameProps = Readonly<{
  saveLifecycle: CareerSaveLifecycle;
  storageFailure?: WebCareerPersistenceFailure;
  onRetryStorage: () => void;
  exitDialog: CareerExitDialogState;
  children: ReactNode;
}>;

/**
 * Owns the providers and dirty-exit dialog repeated by current career routes.
 *
 * Runtime lifecycle and explicit screen routing stay in App; this component is
 * deliberately not a router or a generic page framework.
 */
export function CareerAppFrame({
  saveLifecycle,
  storageFailure,
  onRetryStorage,
  exitDialog,
  children,
}: CareerAppFrameProps): React.JSX.Element {
  return (
    <>
      <CareerSaveLifecycleProvider value={saveLifecycle}>
        <AppShellStorageRecoveryProvider
          failure={storageFailure}
          onRetry={onRetryStorage}
        >
          {children}
        </AppShellStorageRecoveryProvider>
      </CareerSaveLifecycleProvider>
      <UnsavedCareerDialog {...exitDialog} />
    </>
  );
}
