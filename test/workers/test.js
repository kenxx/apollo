'use strict'

const { ApolloWorker } = require('../../index')

new ApolloWorker({
    name: `Worker pid=${process.pid}`,
    develop: true,
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
    }
})