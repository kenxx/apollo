# Intro

Project Apollo is a simple framework to write a Master-Worker NodeJS service.

# Install

```bash
$ npm i apollo-service
```

# Usage

- file master.js

```javascript
'use strict'

const path = require('path')
const {
    Apollo
} = require('apollo-service')

new Apollo({
    // project name
    name: 'TestObject',
    // verbose mode
    develop: true
    // how long we wait to fork again when worker is down
    reforkWaitting: 2000,
    // where to find worker's file
    appPath: path.join(__dirname, 'workers'),
    // define workers
    workers: {
        // name
        test: {
            // fork args
            args: ['test', 'good'],
            // workdir
            cwd: './',
            // fork count
            fork: 3
        }
    },
    beforeInitial() {
        this.writeLine('beforeInitial')
    },
    afterInitial() {
        this.writeLine('afterInitial')
    },
    /** @see https://nodejs.org/docs/latest-v8.x/api/process.html#process_process_events */
    processEvents: {},
    /** @see https://nodejs.org/docs/latest-v8.x/api/cluster.html#cluster_event_disconnect_1 */
    masterEvents: {},
    /** @see https://nodejs.org/docs/latest-v8.x/api/cluster.html#cluster_class_worker */
    workerEvents: {}
})
```

- file workers/test.js

```javascript
'use strict'

const { ApolloWorker } = require('../../index')

new ApolloWorker({
    // set name
    name: `Worker pid=${process.pid}`,
    // verbose mode
    develop: true,
    // run things async
    async run () {
        this.writeLine('test')
        await ApolloWorker.SleepMS(2000)
        this.send('test')
        while (true) {
            await ApolloWorker.SleepMS(5000)
            let i = parseInt(Math.random() * 100)
            if (i > 98) {
                this.writeLine(`unfortunately is ${i}`)
                this.process.exit(1)
            } else {
                this.writeLine(`congraturations is ${i}`)
            }
        }
    },
    // you can bind process event like this
    processEvents: {
        // this will run like `process.on('message', () => {})`
        message (message) {
            this.writeLine(this.name, 'receive message:', message)
            // will print like 'Worker pid=2 receive message: hello world!' when receive a message from pipe
        }
    },
    // simply bind signal
    signal: {
        SIGINT () {
            // act like `process.exit(1)`
            this.exit(1)
        }
    }
})
```
