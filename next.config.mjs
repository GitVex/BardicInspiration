//import MillionLint from '@million/lint';
//import million from 'million/compiler';
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true
};

export default nextConfig

/* export default million.next(MillionLint.next()(nextConfig), {
  auto: true,
}); */