/* eslint-disable react/no-children-prop */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable jsdoc/require-jsdoc */
import clsx from 'clsx';
import type { ReactNode } from 'react';

export function Container({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      // eslint-disable-next-line react/no-children-prop
      children={children}
      className={clsx('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}
    />
  );
}
