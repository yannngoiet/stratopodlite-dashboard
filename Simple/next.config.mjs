const nextConfig = {
  /* config options here */
  reactStrictMode: false,
  
  async redirects() {
    return [{
      source: '/',
      destination: '/auth/sign-in',
      permanent: false
    }];
  }
};
export default nextConfig;