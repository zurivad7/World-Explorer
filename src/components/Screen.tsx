import type { ReactNode } from 'react';

interface ScreenProps {
  title: string;
  subtitle?: string;
  /** Optional control shown next to the title (e.g. a pronounce button). */
  titleAction?: ReactNode;
  children?: ReactNode;
}

/** Consistent screen wrapper: a heading region plus body. */
export function Screen({ title, subtitle, titleAction, children }: ScreenProps) {
  return (
    <section className="screen">
      <div className="screen__head">
        <div className="screen__title-row">
          <h1 className="screen__title">{title}</h1>
          {titleAction}
        </div>
        {subtitle ? <p className="screen__subtitle">{subtitle}</p> : null}
      </div>
      <div className="screen__body">{children}</div>
    </section>
  );
}
