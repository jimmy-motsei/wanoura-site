import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '../../.env.local') })
config({ path: resolve(process.cwd(), '../../.env') })

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb'
    }
  }
}

export default nextConfig
