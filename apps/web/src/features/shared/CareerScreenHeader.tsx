import type { ReactNode } from "react";

/** Props shared by current-career screen headers. */
export type CareerScreenHeaderProps = Readonly<{
  titleId: string;
  title: ReactNode;
  eyebrow?: ReactNode;
  supporting?: ReactNode;
  command?: ReactNode;
  className?: string;
}>;

/**
 * Keeps the current screen identity and its progression command in one stable row.
 * Local tools such as filters and tactical controls remain inside their own workspace.
 */
export function CareerScreenHeader({
  titleId,
  title,
  eyebrow,
  supporting,
  command,
  className,
}: CareerScreenHeaderProps): React.JSX.Element {
  const rootClassName = ["tls-career-screen-header", className].filter(Boolean).join(" ");

  return (
    <header className={rootClassName}>
      <div className="tls-career-screen-heading">
        {eyebrow === undefined ? null : (
          <p className="tls-career-screen-eyebrow">{eyebrow}</p>
        )}
        <h1 className="tls-shell-title" id={titleId}>{title}</h1>
        {supporting === undefined ? null : (
          <div className="tls-career-screen-supporting">{supporting}</div>
        )}
      </div>
      {command === undefined ? null : (
        <div className="tls-career-screen-command">{command}</div>
      )}
    </header>
  );
}
