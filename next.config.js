/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['avatars.githubusercontent.com', 'github.com', 'cdn.discordapp.com', 'lh3.googleusercontent.com'],
    },
}

module.exports = nextConfig
