import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.173', 'localhost', '127.0.0.1'],
  env: {
    REQUIRE_LOGIN_FOR_LOCAL: 'true'
  }
};

export default nextConfig;
