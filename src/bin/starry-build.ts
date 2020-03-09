#!/usr/bin/env node

import { resolve } from 'path'
import { BuildConfig, build } from '../build/build'

const baseConfig: BuildConfig = {
  dirs: {
    project: process.cwd(),
    tmp: resolve(process.cwd(), '.tmp'),
    build: resolve(process.cwd(), '.starry')
  },
  exts: ['.js', '.ts', '.tsx', '.md', '.mdx'],
  excludes: ['pages', 'components', 'node_modules', 'package.json']
}

build(baseConfig).then(() => {
  console.log(`✨ Taa-Dah`)
})
