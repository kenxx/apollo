'use strict'

const events = require('events')
const process = require('process')
const console = require('console')

const _toString = Object.prototype.toString

module.exports = class ApolloProcess extends events.EventEmitter {
    constructor() {
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
            this.bindEventsFromObject(object, this[fromProperty], fromProperty)
        }
    }

    bindEventsFromObject(object, fromObject, name = 'object') {
        if (ApolloProcess.IsPlainObject(fromObject)) {
            for (let event in fromObject) {
                this.writeInfo(`binding event(${event}) from ${name}.`)
                object.on(event, (...args) => {
                    this.writeInfo(`event(${event}) from ${name} emit`)
                    fromObject[event].apply(this, args)
                })
            }
        }
    }

    static async SleepMS(ms) {
        return new Promise((resovle) => setTimeout(() => resovle(), ms))
    }

    static IsPlainObject(obj) {
        return _toString.call(obj) === '[object Object]'
    }

    static SafetyCall(obj, funcName, ...args) {
        if (typeof obj[funcName] == 'function') {
            return obj[funcName].apply(obj, args)
        }
        return null
    }
}