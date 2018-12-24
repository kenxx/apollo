'use strict'

const path = require('path')

module.exports = {
    debugMode: true,
    appPath: path.join(__dirname, '..'),
    workers: [
        {
            name: 'test',
            exec: '', // Default: process.argv[1]
            args: 'good fuck', // or ['arg1', 'arg2'] Default: process.argv.slice(2)
            cwd: '', // Default: project app dir
            type: 'circle',
            fork: 1
        }
    ]
}