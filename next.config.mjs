//import MillionLint from '@million/lint';
//import million from 'million/compiler';
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Lets instrumentation.ts run once at server boot - that's where the nightly prune job
  // gets scheduled. Stable by default from Next 14+; still opt-in on 13.5.
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig

/* export default million.next(MillionLint.next()(nextConfig), {
  auto: true,
}); */