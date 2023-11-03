const { kafka } = require("./client")


async function init() {
    const admin = kafka.admin();
    console.log("Admin connecting....");
    admin.connect()
    console.log("Admin connected");

    console.log("Creating Topics [rider-loc-updates]");
    await admin.createTopics({
        topics: [{
            topic: "rider-loc-updates",
            numPartitions: 2,
        }]
    })
    console.log("Topic created successfully [rider-loc-updates]");

    console.log("Disconnecting admin...");
    await admin.disconnect()
}

init()