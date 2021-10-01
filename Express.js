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

    cron.schedule('*/* * * * *', () => {
        payload = `I am alive at ${new Date()}`
        channel.sendToQueue(queue, Buffer.from(payload))
    })
    
    cron.schedule('*/5 * * * * *', () => {
        payload = 'Every 5 seconds...'
        channel.sendToQueue(queue, Buffer.from(payload))
    })

    cron.schedule('*/42 * * * *', () => {
        payload = '42 is the meaning to life!'
        channel.sendToQueue(queue, Buffer.from(payload))
    })

    app.ws('/heartbeat', (ws, req) => {
        // Postman testing
        ws.on('message', msg => {
            console.log(msg)
            ws.send('Received your message')
        })

        cron.schedule('*/* * * * *', () => {
            payload = `I am alive at ${new Date()}`
            ws.send(payload)
        })

        cron.schedule('*/5 * * * * *', () => {
            payload = 'Every 5 seconds...'
            ws.send(payload)
        })

        cron.schedule('*/42 * * * *', () => {
            payload = '42 is the meaning to life!'
            ws.send(payload)
        })
    })

})()

app.listen(3000)