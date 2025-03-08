import createCache from '@emotion/cache';

export default function createEmotionCache() {
  return createCache({
    key: 'css',
    prepend: true,
    // Use empty array for stylisPlugins by default
    stylisPlugins: [],
  });
}
