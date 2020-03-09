import { BuildConfig, SourcePage } from './build'
import files from '../data/files'
import { resolve as resolvePath } from 'path'
import { renderToStaticMarkup } from 'react-dom/server'
import { promises as fs } from 'fs'
import webpack, { Configuration } from 'webpack'

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

export async function generateServerBundles(
  config: BuildConfig,
  pages: SourcePage[]
): Promise<void> {
  // TODO refactor this into a type-safe reduce() or Array.flat()
  let entry: { [name: string]: string } = {}
  for (let page of pages) {
    if (page.name) {
      entry[page.name] = page.path
    }
  }

  const serverConfig: Configuration = {
    target: 'node',
    entry,
    output: {
      filename: '[name].js',
      path: config.dirs.tmp,
      libraryTarget: 'commonjs'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js']
    },
    module: {
      rules: [
        {
          test: /.tsx?$/,
          exclude: /node_modules/,
          loader: 'ts-loader',
          options: {
            configFile: './tmp/tsconfig.json'
          }
        }
      ]
    }
  }

  await webpack(serverConfig, (err, stats) => {
    if (err) {
      console.error(err)
      return
    }

    console.log(
      stats.toString({
        chunks: false, // Makes the build much quieter
        colors: true // Shows colors in the console
      })
    )
  })
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
