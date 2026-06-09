import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from '@jest/globals'
import nock from 'nock'

const getLoadedFilename = url => {
  const { host, pathname } = new URL(url)
  const normalizedPath = `${host}${pathname}`.replace(/[^a-zA-Z0-9]/g, '-')

  return `${normalizedPath}.html`
}

describe('page loader', () => {
  let tmpDir

  beforeAll(() => {
    nock.disableNetConnect()
  })

  afterAll(() => {
    nock.enableNetConnect()
  })

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'))
  })

  afterEach(async () => {
    nock.cleanAll()
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  test('loads a page into the specified directory and returns file path', async () => {
    const url = 'https://ru.hexlet.io/courses'
    const html = '<html><body>Hexlet courses</body></html>'
    const expectedFilepath = path.join(tmpDir, getLoadedFilename(url))

    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, html)

    const { default: loadPage } = await import('../src/load.js')
    const resultFilepath = await loadPage(url, tmpDir)
    const savedContent = await fs.readFile(expectedFilepath, 'utf-8')

    expect(resultFilepath).toBe(expectedFilepath)
    expect(savedContent).toBe(html)
  })

  test('rejects when request fails and does not create file', async () => {
    const url = 'https://ru.hexlet.io/courses'
    const expectedFilepath = path.join(tmpDir, getLoadedFilename(url))

    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(404)

    const { default: loadPage } = await import('../src/load.js')

    await expect(loadPage(url, tmpDir)).rejects.toThrow()
    await expect(fs.access(expectedFilepath)).rejects.toThrow()
  })
})
