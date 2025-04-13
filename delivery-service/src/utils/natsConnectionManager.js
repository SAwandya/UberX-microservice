const { connect, StringCodec } = require("nats");

class NatsConnectionManager {
  constructor() {
    this.nc = null;
    this.sc = StringCodec();
    this.subscriptions = [];
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

      // Setup reconnection event handler
      this.nc.closed().then(() => {
        console.log("NATS connection closed");
      });

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

  async subscribe(subject, callback) {
    if (!this.nc) {
      await this.connect();
    }

    try {
      const subscription = this.nc.subscribe(subject, {
        queue: "delivery-service", // Use queue group for load balancing
      });

      this.subscriptions.push(subscription);
      console.log(`Subscribed to ${subject}`);

      // Process messages
      for await (const msg of subscription) {
        const data = JSON.parse(this.sc.decode(msg.data));
        await callback(data, msg);
      }
    } catch (error) {
      console.error(`Error subscribing to ${subject}:`, error);
      throw error;
    }
  }
}

module.exports = new NatsConnectionManager();
