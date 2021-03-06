'use strict'

const cluster = require('cluster')
const path = require('path')
const ApolloProcess = require('./apollo_process')

/**
 * Apollo Master Process
 */
module.exports = class Apollo extends ApolloProcess {
    /**
     * Apollo Constructor
     * @param {Array} config 
     */
    constructor(config) {
        super()
        this.name = 'Apollo'
        this.writeLine(`Apollo Master run on PID=${this.process.pid}`)
        this.appPath = this.process.cwd()
        this.cluster = cluster
        this.reforkWaitting = 500

        this.__workers = {}
        this.__workersSettings = {}
        this.__systemShutdown = false

        Apollo.SafetyCall(this, 'beforeInitial')
        Object.assign(this, config)
        this.__initial()
    }

    async __initial() {
        this.bindEventsFromObject(this.process, this.__defaultSignal, 'defaultSignalHandle')
        this.bindEventsFromObject(this.process, this.__defaultProcessEvents, 'defaultProcessEvents')
        this.bindEventsFromObject(this.cluster, this.__defaultMasterEvents, 'defaultMasterEvents')
        this.bindEvents(this.process, 'signal')
        this.bindEvents(this.process, 'processEvents')
        this.bindEvents(this.cluster, 'masterEvents')
        Apollo.SafetyCall(this, 'afterInitial')
        await Apollo.SafetyCall(this, 'beforeStart')
        await this.__start()
        await Apollo.SafetyCall(this, 'afterStart')
    }

    async __start() {
        if (Apollo.IsPlainObject(this['workers'])) {
            for (let name in this.workers) {
                let worker = this.workers[name]
                let settings = this.__makeSettings(
                    name,
                    worker['args'] || [],
                    worker['cwd'] || undefined,
                    worker['fork'] || 1,
                )
                this.__workersSettings[name] = settings
                this.__startWorker(name)
            }
        } else {
            throw new Error('can not found workers')
        }
    }

    get __defaultProcessEvents() {
        return {
            uncaughtException(err) {
                if (this.develop) {
                    this.console.trace(err)
                }
            }
        }
    }

    get __defaultSignal() {
        return {
            SIGINT () {
                this.writeLine('Receive SIGINT, shutting down the system, now killing children.')
                this.__systemShutdown = true
            }
        }
    }

    get __defaultMasterEvents() {
        return {
            disconnect(worker) {
                this.writeLine(`worker #${worker.id} has disconnected`)
            },
            async exit(worker, code, signal) {
                this.writeLine(`worker #${worker.id} pid=${worker.process.pid} died (${signal || code}).`)
                if (! this.__systemShutdown) {
                    this.writeLine(`restarting in ${this.reforkWaitting} ms...`)
                    await Apollo.SleepMS(this.reforkWaitting)
                    this.__restart(worker.id, this.__workers[worker.id].name)
                } else {
                    this.writeLine('System is shutting down by SIGINT')
                }
            }
        }
    }

    get __defaultWorkerEvents() {
        return {

        }
    }

    __restart(id, name) {
        let new_id = this.__fork(name)
        if (new_id !== id) {
            delete this.__workers[id]
        }
    }

    __startWorker(name) {        
        for (let i = 0; i < this.__workersSettings[name].fork; i++) {
            this.__fork(name)
        }
    }

    __fork(name) {
        this.cluster.setupMaster(this.__workersSettings[name].setup)
        let worker = this.cluster.fork({
            APOLLO_WORKER: true
        })

        let workerPid = worker.process.pid
        this.writeInfo(`Forked ${name} at pid ${workerPid} id ${worker.id}`)

        this.bindEventsFromObject(worker, this.__defaultWorkerEvents, 'defaultWorkerEvents')
        this.bindEvents(worker, 'workerEvents')

        this.__workers[worker.id] = {
            name: name,
            pid: workerPid,
            worker: worker
        }

        return worker.id
    }

    __makeSettings(name, args, cwd, fork) {
        return {
            setup: {
                exec: path.join(this.appPath, name),
                args: typeof args === 'string' ? args.split(/\s+/) : JSON.parse(JSON.stringify(args)),
                cwd: cwd && path.isAbsolute(cwd) ? cwd : this.appPath,
            },
            fork: fork > 1 ? fork : 1
        }
    }
}