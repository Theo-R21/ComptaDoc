import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    webpackDevMiddleware: (config: { watchOptions: { poll: number; aggregateTimeout: number; }; }) => {
        config.watchOptions = {
            poll: 1000,
            aggregateTimeout: 300,
        }
        return config
    },

};

export default nextConfig;
