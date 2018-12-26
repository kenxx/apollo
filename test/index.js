'use strict'

const path = require('path')
const {
    Apollo
} = require('../index')
const console = require('console')

new Apollo({
    name: 'TestObject',
    develop: true,
    reforkWaitting: 2000,
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
    processEvents: {
        beforeExit() {},
        disconnect() {},
        exit() {},
        message() {},
        rejectionHandled(err) {console.trace(err)},
        uncaughtException(err) {console.trace(err)},
        unhandledRejection(err) {console.trace(err)},
        warning() {}
    },
    masterEvents: {
        disconnect() {},
        exit() {},
        fork() {},
        listening() {},
        message() {},
        online() {},
        setup() {}
    },
    workerEvents: {
        disconnect() {},
        error() {},
        exit() {},
        listening() {},
        message() {},
        online() {},
    }
})