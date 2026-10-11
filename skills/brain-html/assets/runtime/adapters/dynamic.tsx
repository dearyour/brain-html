import React, { lazy, Suspense } from 'react';

// Next's client-only dynamic import, without a Next server or chunk requests.
export default function dynamic(loader: () => Promise<any>, options: any = {}) {
  const Component = lazy(() => loader().then((mod) => ({ default: mod.default ?? mod })));
  return function Dynamic(props: any) {
    const Loading = options.loading;
    return <Suspense fallback={Loading ? <Loading /> : null}><Component {...props} /></Suspense>;
  };
}
