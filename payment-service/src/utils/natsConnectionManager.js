const { connect, StringCodec } = require("nats");

class NatsConnectionManager {
  constructor() {
    this.nc = null;
    this.sc = StringCodec();
  }

  async connect() {
    try {
      this.nc = await connect({
        servers: process.env.NATS_URL || "nats://nats:4222",
        timeout: 3000,
        reconnect: true,
        maxReconnectAttempts: 10,
      });
      console.log("Connected to NATS server");
      return this.nc;
    } catch (error) {
      console.error("Error connecting to NATS:", error);
      throw error;
    }
  }

  async disconnect() {
    if (this.nc) {
      await this.nc.drain();
      console.log("Disconnected from NATS server");
    }
  }

  async publishMessage(subject, data) {
    if (!this.nc) {
      await this.connect();
    }

    try {
      this.nc.publish(subject, this.sc.encode(JSON.stringify(data)));
      console.log(`Published message to ${subject}`);
    } catch (error) {
      console.error(`Error publishing message to ${subject}:`, error);
      throw error;
    }
  }
}

module.exports = new NatsConnectionManager();