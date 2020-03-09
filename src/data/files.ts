import { BuildConfig } from './../build/build'
import { resolve } from 'path'
import glob from 'fast-glob'

export default async function(config: BuildConfig) {
  const root = resolve(config.dirs.project, '**/*')
  const files = await glob(root, {
    ignore: ['**/node_modules', ...config.excludes],
    objectMode: true
  })
  return files
}
