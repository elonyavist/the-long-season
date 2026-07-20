/** Executable adapter for the structured Phase 77 live-match gate report. */
import { runLiveMatchControlReportCommand } from "./live-match-control-report.ts";

process.exitCode = runLiveMatchControlReportCommand(process.argv.slice(2));
