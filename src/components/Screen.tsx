import type { ReactNode } from 'react';

interface ScreenProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

/** Consistent screen wrapper: a heading region plus body. */
export function Screen({ title, subtitle, children }: ScreenProps) {
  return (
    <section className="screen">
      <div className="screen__head">
        <h1 className="screen__title">{title}</h1>
        {subtitle ? <p className="screen__subtitle">{subtitle}</p> : null}
      </div>
      <div className="screen__body">{children}</div>
    </section>
  );
}
