#!/usr/bin/env node

import packageJson from './package.json' with { type: 'json' }
import { program } from 'commander'
import loadPage from './src/load.js'

program
  .name('page-loader')
  .arguments('<url>')
  .description('Page loader utility')
  .version(packageJson.version)
  .option(
    '-o, --output [dir]',
    'Output dir (default: user current working directory)',
  )
  .action((url, { output }) => {
    loadPage(url, output)
      .then(filepath => console.log(filepath))
      .catch(e => {
        console.error(e.message)
        process.exitCode = 1
      })
  })
program.parse(process.argv)
