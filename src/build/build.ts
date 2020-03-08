import glob from 'fast-glob'
import { resolve } from 'path'
import { promises as fs } from 'fs'
import { renderPages } from './server'

export interface BuildConfig {
  dirs: {
    tmp: string
    build: string
    project: string
  }
  exts: Array<string>
}

export interface SourcePage {
  path: string
  name: string
  ext: string
}

// Extract page information for source pages
function processSourcePages(pages: string[]): Array<SourcePage> | never {
  return pages.map((path: string) => {
    const matches = path.match(/pages\/(.+)\.(js|jsx|ts|tsx)$/)
    const name = matches && matches[1]
    const ext = matches && matches[2]

    if (!name || !ext) {
      throw new Error(`Error processing page ${path}`)
    }

    return {
      path,
      name,
      ext
    }
  })
}

async function cleanUp(config: BuildConfig) {
  // Remove the temporary directory
  // await fs.rmdir(config.dirs.tmp, { recursive: true })
}

export async function build(config: BuildConfig): Promise<void> {
  // Make sure that our build directories are present
  const recursive = true
  await fs.mkdir(config.dirs.tmp, { recursive })
  await fs.mkdir(config.dirs.build, { recursive })

  // Find all page components
  const pathToPages = resolve(config.dirs.project, 'pages')
  const extensions = config.exts.join(',')
  const pagePaths = await glob(`${pathToPages}/*{${extensions}}`)

  // Statically render pages
  const pages = processSourcePages(pagePaths)
  await renderPages(config, pages)

  await cleanUp(config)
}
