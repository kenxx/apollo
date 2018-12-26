'use strict'

const events = require('events')
const process = require('process')
const console = require('console')

module.exports = class ApolloProcess extends events.EventEmitter {
    constructor () {
        super()
        this.develop = false
        this.process = process
        this.name = this.process.title
        this.console = new console.Console(this.process.stdout, this.process.stderr)
    }

    writeLine(...args) {
        args.unshift(`[${new Date().toLocaleString()}]`, `[${this.name}]`)
        this.console.log(...args)
    }

    writeInfo(...args) {
        if (this.develop) {
            this.writeLine(...args)
        }
    }

    bindEvents(object, fromProperty) {
        if (this[fromProperty]) {
            for (let event in this[fromProperty]) {
                this.writeInfo(`binding event(${event}) from ${fromProperty}.`)
                object.on(event, (...args) => {
                    this.writeInfo(`event(${event}) from ${fromProperty} emit`)
                    this[fromProperty][event].apply(this, args)
                })
            }
        }
    }

    static async SleepMS(ms) {
        return new Promise((resovle) => setTimeout(() => resovle(), ms))
    }
}