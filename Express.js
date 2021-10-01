const express = require('express');
const enableWs = require('express-ws');
const cron = require('node-cron')
const amqplib = require('amqplib')

const queue = 'heartbeat'

const app = express();
enableWs(app);

; (async () => {
    const client = await amqplib.connect('amqp://localhost:5672')
    const channel = await client.createChannel()
    await channel.assertQueue(queue)

    cron.schedule('*/5 * * * * *', () => {
        payload = 'Every 5 seconds...'
        channel.sendToQueue(queue, Buffer.from(payload))
    })

    cron.schedule('*/* * * * *', () => {
        payload = `I am alive at ${new Date()}`
        channel.sendToQueue(queue, Buffer.from(payload))
    })

    cron.schedule('*/42 * * * *', () => {
        payload = '42 is the meaning to life!'
        channel.sendToQueue(queue, Buffer.from(payload))
    })

    app.ws('/heartbeat', (ws, req) => {
        console.log('Client connected');

        const fiveSecondsCronSchedule = cron.schedule('*/5 * * * * *', () => {
            payload = 'Every 5 seconds...'
            ws.send(payload)
        })

        const minuteCronSchedule = cron.schedule('*/* * * * *', () => {
            payload = `I am alive at ${new Date()}`
            ws.send(payload)
        })

        const minute42CronSchedule = cron.schedule('*/42 * * * *', () => {
            payload = '42 is the meaning to life!'
            ws.send(payload)
        })

        // stop cron jobs
        ws.on('close', () => {
            console.log("Client disconnecting")
            fiveSecondsCronSchedule.stop()
            minuteCronSchedule.stop()
            minute42CronSchedule.stop()
        })

        // Postman testing
        ws.on('message', msg => {
            console.log(msg)
            ws.send('Received your message')
        })
    })
})()

app.listen(3000)