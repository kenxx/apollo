'use strict'

const events = require('events')
const process = require('process')
const console = require('console')

module.exports = class ApolloProcess extends events.EventEmitter {
    constructor (config) {
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

    bindEvents(object, from) {
        if (this[from]) {
            for (let event in this[from]) {
                this.writeInfo(`binding event(${event}) from ${from}.`)
                object.on(event, (...args) => {
                    this.writeInfo(`event(${event}) from ${from} emit`)
                    this[from][event].apply(this, args)
                })
            }
        }
    }
}