// -*- mode: javascript; js-indent-level: 2 -*-

import * as core from '@actions/core'
import {SnapcraftBuilder} from './build'

async function run(): Promise<void> {
  try {
    const path = core.getInput('path')
    core.info(`Building Snapcraft project in "${path}"...`)

    const snapcraft = core.getInput('builder')
    core.info(`Building with snapcraft from "${snapcraft}"`)

    const builder = new SnapcraftBuilder(snapcraft, path)
    await builder.build()
    const snap = await builder.outputSnap()
    core.setOutput('snap', snap)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
