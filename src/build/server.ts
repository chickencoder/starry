import { BuildConfig, SourcePage } from './build'
import files from '../data/files'
import { InputOptions, OutputOptions, rollup } from 'rollup'
import { resolve as resolvePath } from 'path'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { renderToStaticMarkup } from 'react-dom/server'
import { promises as fs } from 'fs'

function templatePage(html: string) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Starry Page</title>
</head>
<body>
  <div id="starry">
    ${html}
  </div>
</body>
</html>
  `
}

async function bundle(
  inputOptions: InputOptions,
  outputOptions: OutputOptions
): Promise<void> {
  const bundle = await rollup(inputOptions)
  await bundle.generate({})
  await bundle.write(outputOptions)
}

export async function generateServerBundles(
  config: BuildConfig,
  pages: SourcePage[]
): Promise<void> {
  // TODO refactor this into a type-safe reduce() or Array.flat()
  let input: { [name: string]: string } = {}
  for (let page of pages) {
    if (page.name) {
      input[page.name] = page.path
    }
  }

  // Input options specifify each of our pages, plugins
  // for compiling pages on the server-side (node-resolve, commonjs)
  // with typescript compiler
  const inputOptions: InputOptions = {
    input,
    plugins: [
      resolve({
        extensions: config.exts
      }),
      commonjs({
        include: /node_modules/
      }),
      typescript({
        jsx: 'react',
        module: 'es6',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        target: 'es5'
      })
    ]
  }

  // Output files are written to temporary directory
  // because these are only used server-side to render
  // static markup with react-dom
  const outputOptions: OutputOptions = {
    dir: config.dirs.tmp,
    format: 'cjs'
  }

  await bundle(inputOptions, outputOptions)
}

export async function renderPages(
  config: BuildConfig,
  pages: SourcePage[]
): Promise<void> {
  // Generate our bundles
  await generateServerBundles(config, pages)

  // Assemble the data layer
  const props = {
    data: {
      files: await files(config)
    }
  }

  // Require bundles and render HTML
  for await (let page of pages) {
    const src = resolvePath(config.dirs.tmp, page.name)
    const Page = await import(src)
    const html = renderToStaticMarkup(Page.default(props))

    // Write to *.html file
    const outputPath = resolvePath(config.dirs.build, `${page.name}.html`)
    const output = templatePage(html)
    await fs.writeFile(outputPath, output)
  }
}
