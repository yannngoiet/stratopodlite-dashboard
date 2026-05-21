// Fix self-signed SSL for local .NET API development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const nextConfig = {
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
