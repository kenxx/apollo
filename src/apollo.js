'use strict'

const cluster = require('cluster')
const path = require('path')
const ApolloProcess = require('./apollo_process')

const SafetyCall = (obj, funcName, ...args) => {
    if (typeof obj[funcName] == 'function') {
        return obj[funcName].apply(obj, args)
    }
    return null
}

const _toString = Object.prototype.toString
const isPlainObject = (obj) => {
    return _toString.call(obj) === '[object Object]'
}

module.exports = class Apollo extends ApolloProcess {
    constructor(config) {
        super()
        this.name = 'Apollo'
        this.appPath = this.process.cwd()
        this.cluster = cluster
        this.reforkWaitting = 500
        this._forks = {}

        SafetyCall(this, 'beforeInitial')
        Object.assign(this, config)
        this.__initial()
    }

    __initial() {
        this.bindEvents(this.process, '__defaultProcessEvents')
        this.bindEvents(this.process, 'processEvents')
        this.bindEvents(this.cluster, '__defaultMasterEvents')
        this.bindEvents(this.cluster, 'masterEvents')
        SafetyCall(this, 'afterInitial')
        this.__start()
    }

    __start() {
        if (isPlainObject(this['workers'])) {
            for (let name in this.workers) {
                let worker = this.workers[name]
                let settings = this.__makeSettings(
                    name,
                    worker['args'] || [],
                    worker['cwd'] || undefined,
                    worker['fork'] || 1,
                )
                this.__fork(settings)
            }
        } else {
            throw new Error('can not found workers')
        }
    }

    get __defaultProcessEvents() {
        return {

        }
    }

    get __defaultMasterEvents() {
        return {
            disconnect(worker) {
                this.writeInfo(`The worker #${worker.id} has disconnected`)
            },
            async exit(worker, code, signal) {
                this.writeInfo(`worker ${worker.process.pid} died (${signal || code}). restarting in ${this.reforkWaitting} ms...`)
                await Apollo.SleepMS(this.reforkWaitting)
                this.__fork(this._forks[worker.id].settings)
            }
        }
    }

    get __defaultWorkerEvents() {
        return {

        }
    }

    __fork(settings) {
        this.cluster.setupMaster(settings.setup)
        for (let i = 0; i < settings.fork; i++) {
            let workerObject = this.cluster.fork({
                APOLLO_WORKER: true
            })
            let workerPid = workerObject.process.pid
            this._forks[workerObject.id] = {
                pid: workerPid,
                worker: workerObject,
                settings: settings
            }
            this.bindEvents(workerObject, '__defaultEvents')
            this.bindEvents(workerObject, 'workerEvents')
            this.writeInfo(`Forked ${settings.name} at pid ${workerPid} count ${i} id ${workerObject.id}`)
        }
    }

    __makeSettings(name, args, cwd, fork) {
        return {
            name: name,
            setup: {
                exec: path.join(this.appPath, name),
                args: typeof args === 'string' ? args.split(/\s+/) : JSON.parse(JSON.stringify(args)),
                cwd: cwd && path.isAbsolute(cwd) ? cwd : this.appPath,
            },
            fork: fork > 1 ? fork : 1,
            worker: {}
        }
    }
}