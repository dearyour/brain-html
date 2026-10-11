import React from 'react';

export default function Link({ href, children, ...props }: any) {
  const path = typeof href === 'string' ? href : '#';
  return <a {...props} href={path} onClick={(event) => {
    if (path.startsWith('/')) {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent('brain-html:navigate', { detail: path.slice(1).split(/[?#]/)[0] }));
    } else props.onClick?.(event);
  }}>{children}</a>;
}
