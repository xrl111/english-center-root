import createCache from '@emotion/cache';

export default function createEmotionCache() {
  const isBrowser = typeof document !== 'undefined';

  return createCache({
    key: 'css',
    prepend: true,
    // Prevent FOUC on server side
    stylisPlugins: isBrowser ? [] : [
      require('stylis-plugin-rtl')(),
    ],
  });
}