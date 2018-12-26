'use strict'

const path = require('path')
const { ApolloWorker } = require('../../index')

console.log('forked, ', process.ppid, process.pid)


const sleep = async (ms) => new Promise((resolve) => setTimeout((res) => resolve(res), ms))

new ApolloWorker({
    name: 'Worker',
    async run () {
        this.writeLine('test')
        await sleep(2000)
        this.send('test')
        await sleep(5000)
        this.process.exit(1)
    }
})