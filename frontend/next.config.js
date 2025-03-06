/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@fullcalendar/common',
    '@fullcalendar/core',
    '@fullcalendar/daygrid',
    '@fullcalendar/interaction',
    '@fullcalendar/react',
    '@fullcalendar/timegrid'
  ],
  webpack: (config) => {
    // Reset css rules
    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((one) => {
          if (one.test?.toString().includes('css')) {
            one.include = undefined;
            one.exclude = undefined;
          }
        });
      }
    });

    return config;
  },
  // Ensure CSS modules work properly
  sassOptions: {
    includePaths: ['./styles'],
  },
};

module.exports = nextConfig;