'use strict'

const path = require('path')
const {
    Apollo
} = require('../index')

new Apollo({
    name: 'TestObject',
    reforkWaitting: 5000,
    appPath: path.join(__dirname, 'workers'),
    workers: {
        test: {
            args: ['test', 'good'],
            cwd: './',
            fork: 1
        }
    },
    afterInitial() {
        this.writeLine('test')
    },
})