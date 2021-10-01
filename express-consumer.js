const amqplib = require('amqplib')
const fs = require('fs')

const queue = 'heartbeat'
const logger = fs.createWriteStream('log.txt', {
  flags: 'a' // 'a' means appending (old data will be preserved)
})

;(async () => {
  const client = await amqplib.connect('amqp://localhost:5672')
  const channel = await client.createChannel()
  await channel.assertQueue(queue)
  channel.consume(queue, (msg) => {
    console.log(msg.content.toString())
    logger.write(msg.content.toString())
	  channel.ack(msg)
  })
})()
