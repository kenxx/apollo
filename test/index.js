'use strict'

const path = require('path')
const {
    Apollo
} = require('../index')

new Apollo({
    name: 'TestObject',
    reforkWaitting: 2000,
    appPath: path.join(__dirname, 'workers'),
    workers: {
        test: {
            args: ['test', 'good'],
            cwd: './',
            fork: 3
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
        uncaughtException(err) {this.writeLine(err.message)},
        unhandledRejection(reason, p) {this.writeLine(reason, p)},
        warning() {}
    },
    masterEvents: {
        disconnect() {},
        exit() {
            this.process
        },
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