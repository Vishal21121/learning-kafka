# Apache kafka

## Problem solved by kafka

- In large application where data is produced at a very faster rate and it is to be stored in the database but data read and write speed of the database is very low hence if we try to store the data at which it is being produced will make the database go down and here kafka comes into play.
- Kafka has a very high read and write speed but it does not have persistant storage like a database hence we finally need to store data in the database.

  ## Running zookeeper and Kafka service in docker

  ### Commands

  - Start the Zookeeper Container and expose PORT `2181`.
    `docker run -p 2181:2181 zookeeper`
  - Start Kafka Container, expose PORT `9092` and setup ENV variables.

  ```bash
  docker run -p 9092:9092 \
  -e KAFKA_ZOOKEEPER_CONNECT=<PRIVATE_IP>:2181 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://<PRIVATE_IP>:9092 \
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
  confluentinc/cp-kafka
  ```

  - KAFKA_ZOOKEEPER_CONNECT=<PRIVATE_IP>:2181 \ ⇒ it is for telling kakfa that zookeeper is running at port 2181
  - -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://<PRIVATE_IP>:9092 \ ⇒ it’s for stating where Kafka will run
  - -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 ⇒ it is for stating the replica count of the Kafka server.
  - There are three persons involved in kafka
    - Admin: who create topic, partitions.
    - Producer: who creates data
    - Consumer: who consumes data.

  ## Coding time 👩‍💻

  - client.js

  ```jsx
  const { Kafka } = require("kafkajs");

  exports.kafka = new Kafka({
    // clientId can be anything of our choice.
    clientId: "my-first-kafka-app",
    // whole service which is running on port 9092 is known as broker
    brokers: ["192.168.0.109:9092"],
  });
  ```

  - Admin.js

  ```jsx
  const { kafka } = require("./client");

  async function init() {
    const admin = kafka.admin();
    console.log("Admin connecting....");
    admin.connect();
    console.log("Admin connected");

    console.log("Creating Topics [rider-loc-updates]");
    await admin.createTopics({
      topics: [
        {
          topic: "rider-loc-updates",
          numPartitions: 2,
        },
      ],
    });
    console.log("Topic created successfully [rider-loc-updates]");

    console.log("Disconnecting admin...");
    await admin.disconnect();
  }

  init();
  ```

  - producer.js

  ```jsx
  const { kafka } = require("./client");
  const readline = require("readline");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async function init() {
    const producer = kafka.producer();
    console.log("connecting producer");
    await producer.connect();
    console.log("Producer Connected successfully");

    rl.setPrompt("> ");
    rl.prompt();

    rl.on("line", async function (line) {
      const [riderName, location] = line.split(" ");
      await producer.send({
        topic: "rider-loc-updates",
        messages: [
          {
            partition: location.toLowerCase() === "north" ? 0 : 1,
            key: "location-update",
            value: JSON.stringify({
              name: riderName,
              location,
            }),
          },
        ],
      });
    }).on("close", async () => {
      await producer.disconnect();
    });
  }

  init();
  ```

  - consumer.js

  ```jsx
  const { kafka } = require("./client");

  const group = process.argv[2];

  async function init() {
    const consumer = kafka.consumer({ groupId: group });
    await consumer.connect();

    await consumer.subscribe({
      topics: ["rider-loc-updates"],
      fromBeginning: true,
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        // here we do the computation or analyze the message what we received
        console.log(
          `${group} [${topic}]: PART:${partition}: ${message.value.toString()} `
        );
      },
    });
  }

  init();
  ```

  1. At first run admin.js by ⇒ `node admin.js`
  2. Then run consumer.js by ⇒ `node consumer.js groupName`
  3. Then run producer.js by ⇒ `node producer.js`
