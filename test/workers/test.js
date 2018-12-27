'use strict'

const { ApolloWorker } = require('../../index')

new ApolloWorker({
    name: 'Worker',
    develop: true,
    async run () {
        this.writeLine('test')
        await ApolloWorker.SleepMS(2000)
        this.send('test')
        while (true) {
            await ApolloWorker.SleepMS(5000)
            let i = parseInt(Math.random() * 100)
            if (i > 50) {
                this.writeLine(`unfortunately is ${i}`)
                this.process.exit(1)
            }
        }
    }
})