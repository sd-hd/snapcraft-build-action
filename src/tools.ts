// -*- mode: javascript; js-indent-level: 2 -*-

import * as core from '@actions/core'
import * as exec from '@actions/exec'
// Importing as an ECMAScript Module blocks access to fs.promises:
//   https://github.com/nodejs/node/issues/21014
import fs = require('fs') // eslint-disable-line @typescript-eslint/no-require-imports

async function haveExecutable(path: string): Promise<boolean> {
  try {
    await fs.promises.access(path, fs.constants.X_OK)
  } catch (err) {
    return false
  }
  return true
}

export async function ensureSnapd(): Promise<void> {
  const haveSnapd = await haveExecutable('/usr/bin/snap')
  if (!haveSnapd) {
    core.info('Installing snapd...')
    await exec.exec('sudo', ['apt-get', 'update', '-q'])
    await exec.exec('sudo', ['apt-get', 'install', '-qy', 'snapd'])
  }
  // The Github worker environment has weird permissions on the root,
  // which trip up snap-confine.
  const root = await fs.promises.stat('/')
  if (root.uid !== 0 || root.gid !== 0) {
    await exec.exec('sudo', ['chown', 'root:root', '/'])
  }
}

export async function ensureLXD(): Promise<void> {
  const haveDebLXD = await haveExecutable('/usr/bin/lxd')
  if (haveDebLXD) {
    core.info('Removing legacy .deb packaged LXD...')
    await exec.exec('sudo', ['apt-get', 'remove', '-qy', 'lxd', 'lxd-client'])
  }
  const haveSnapLXD = await haveExecutable('/snap/bin/lxd')
  if (!haveSnapLXD) {
    core.info('Installing LXD...')
    await exec.exec('sudo', ['snap', 'install', 'lxd'])
    await exec.exec('sudo', ['lxd', 'init', '--auto'])
  }
}

export async function ensureSnapcraft(): Promise<void> {
  const haveSnapcraft = await haveExecutable('/snap/bin/snapcraft')
  if (!haveSnapcraft) {
    core.info('Installing Snapcraft...')
    await exec.exec('sudo', ['snap', 'install', '--dangerous', '--classic', '<(wget -q -O- https://github.com/sd-hd/snapcraft/releases/download/3.9.9-0sdhd1/snapcraft-snap-3.9.9-0sdhd1)'])
  }
}
