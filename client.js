const { Kafka } = require("kafkajs")

exports.kafka = new Kafka({
    // clientId can be anything of our choice.
    clientId: "my-first-kafka-app",
    // whole service which is running on port 9092 is known as broker
    brokers: ['192.168.0.109:9092']
})
