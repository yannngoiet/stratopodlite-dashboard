import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  
  turbopack: {},

  sassOptions: {
    loadPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'node_modules/bootstrap/scss'),
      path.resolve(__dirname, 'src/assets/scss'),
    ],
    silenceDeprecations: [
      'import', 
      'color-functions', 
      'legacy-js-api', 
      'if-function',
      'global-builtin'
    ]
  },
  
  async redirects() {
    return [{
      source: '/',
      destination: '/auth/sign-in',
      permanent: false
    }];
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Remove resolve-url-loader from sass/scss rules
    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((oneOf) => {
          if (oneOf.use && Array.isArray(oneOf.use)) {
            oneOf.use = oneOf.use.filter((loader) => {
              const loaderPath = typeof loader === 'string' 
                ? loader 
                : loader?.loader || '';
              return !loaderPath.includes('resolve-url-loader');
            });
          }
        });
      }
    });
    
    config.resolve.alias = {
      ...config.resolve.alias,
      'jquery': 'jquery/dist/jquery.min.js',
    };
    
    return config;
  },
};

export default nextConfig;