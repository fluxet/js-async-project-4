import axios from 'axios'
import fsp from 'fs/promises'
import path from 'path'

const makeFileName = url => {
  const [, baseUrl] = url.split('//')
  return baseUrl.replace(/[^A-Za-z0-9]/g, '-') + '.html'
}

const loadPage = (url, outputDir = process.cwd()) => {
  const fileName = makeFileName(url)
  const filepath = path.join(outputDir, fileName)

  return axios
    .get(url)
    .then(response => fsp.writeFile(filepath, response.data))
    .then(() => filepath)
}

export default loadPage

// -------------testing-------------------

// loadPage('https://ru.hexlet.io/courses', './assets')
