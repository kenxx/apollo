'use strict'

const cluster = require('cluster')
const path = require('path')
const ApolloProcess = require('./apollo_process')

const SafetyCall = (obj, func, ...args) => {
    if (typeof obj[func] == 'function') {
        return obj[func](...args)
    }
    return null
}
const isObject = (obj) => {
    return obj !== null && typeof obj === 'object'
}

const _toString = Object.prototype.toString
const isPlainObject = (obj) => {
    return _toString.call(obj) === '[object Object]'
}

const sleep = async (ms) => new Promise((resolve) => setTimeout((res) => resolve(res), ms))

module.exports = class Apollo extends ApolloProcess {
    constructor(config) {
        super(config)
        this.name = 'Apollo'
        this.appPath = this.process.cwd()
        this.cluster = cluster
        this._forks = {}

        SafetyCall(this, 'beforeInitial')
        Object.assign(this, config)
        this.__initial()
    }

    __initial() {
        this.__bindEvents(this.process, '__defaultProcessEvents')
        this.__bindEvents(this.process, 'processEvents')
        this.__bindEvents(this.cluster, '__defaultMasterEvents')
        this.__bindEvents(this.cluster, 'masterEvents')
        SafetyCall(this, 'afterInitial')
        this.__start()
    }

    __start() {
        if (isPlainObject(this['workers'])) {
            for (let name in this.workers) {
                let worker = this.workers[name]
                let settings = this.__makeForkSetup(
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

    __bindDefaultProcessEvents() {
        return {

        }
    }

    get __defaultMasterEvents() {
        return {
            disconnect(worker) {
                this.writeInfo(`The worker #${worker.id} has disconnected`)
            },
            async exit(worker, code, signal) {
                console.log('worker %d died (%s). restarting...', worker.process.pid, signal || code)
                await sleep(this.reforkWaitting || 200)
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
            this.__bindEvents(workerObject, '__defaultEvents')
            this.__bindEvents(workerObject, 'workerEvents')
            this.writeInfo(`Forked ${settings.name} at pid ${workerPid} count ${i} id ${workerObject.id}`)
        }
    }

    __makeForkSetup(name, args, cwd, fork) {
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