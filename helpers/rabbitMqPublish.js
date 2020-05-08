//file for sender to queue
const amqp = require('amqplib');
const amqpUrl = 'amqp://gwzbghpd:ow4QVHGBzQUqdAPZI0hFYCk8fwdliCQM@elephant.rmq.cloudamqp.com/gwzbghpd';
const publishToQueue = async (queue, message) => {
    try {
        const cluster = await amqp.connect(amqpUrl);
        const channel = await cluster.createChannel();
        await channel.assertQueue(queue, {durable: true});
        await channel.sendToQueue(queue, Buffer.from(message));

        console.info(' [x] Sending message to queue', queue, message);

    } catch (error) {
        // handle error response
        console.error(error, 'Unable to connect to cluster!');
        process.exit(1);
    }

}
module.exports = publishToQueue;