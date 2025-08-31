/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: { ignoreDuringBuilds: true },   // ESLint 에러가 있어도 빌드 진행
    typescript: { ignoreBuildErrors: true } // (선택) TS 에러도 무시
};
module.exports = nextConfig;