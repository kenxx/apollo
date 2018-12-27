'use strict'

const path = require('path')
const {
    Apollo
} = require('../index')

new Apollo({
    name: 'TestObject',
    develop: true,
    reforkWaitting: 2000,
    appPath: path.join(__dirname, 'workers'),
    workers: {
        test: {
            args: ['test', 'good'],
            cwd: './',
            fork: 2
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
        rejectionHandled(reason, p) {this.writeLine(reason, p)},
        uncaughtException() {},
        unhandledRejection(reason, p) {this.writeLine(reason, p)},
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