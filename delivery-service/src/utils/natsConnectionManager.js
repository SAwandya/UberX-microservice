const { connect, StringCodec } = require("nats");

class NatsConnectionManager {
  constructor() {
    this.nc = null;
    this.sc = StringCodec();
    this.subscriptions = [];
    this.isConnecting = false;
    this.connectionAttempts = 0;
    this.maxReconnectAttempts = 15;
    this.reconnectTimeWait = 2000;
  }

  async connect() {
    // Prevent multiple concurrent connection attempts
    if (this.isConnecting) {
      console.log("Connection attempt already in progress");
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = this._connectWithRetry();
    return this.connectionPromise;
  }

  async _connectWithRetry() {
    try {
      this.connectionAttempts++;
      console.log(`Connecting to NATS server (attempt ${this.connectionAttempts}/${this.maxReconnectAttempts})`);
      console.log(`Using NATS URL: ${process.env.NATS_URL || "nats://nats.uberx-nats.svc.cluster.local:4222"}`);

      this.nc = await connect({
        servers: process.env.NATS_URL || "nats://nats.uberx-nats.svc.cluster.local:4222",
        timeout: 5000,
        reconnect: true,
        maxReconnectAttempts: this.maxReconnectAttempts,
        reconnectTimeWait: this.reconnectTimeWait,
      });

      // Reset connection attempts on successful connection
      this.connectionAttempts = 0;
      this.isConnecting = false;
      console.log("Successfully connected to NATS server");

      // Setup reconnection event handler
      this.nc.closed().then(() => {
        console.log("NATS connection closed");
        this.nc = null;
      });

      return this.nc;
    } catch (error) {
      console.error("Error connecting to NATS:", error);

      // Try again if we haven't reached max attempts
      if (this.connectionAttempts < this.maxReconnectAttempts) {
        console.log(`Waiting ${this.reconnectTimeWait}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, this.reconnectTimeWait));
        this.isConnecting = false;
        return this.connect(); // Try connecting again
      }

      this.isConnecting = false;
      throw new Error(`Failed to connect to NATS after ${this.maxReconnectAttempts} attempts: ${error.message}`);
    }
  }

  async disconnect() {
    if (this.nc) {
      await this.nc.drain();
      this.nc = null;
      console.log("Disconnected from NATS server");
    }
  }

  async subscribe(subject, callback) {
    let attempts = 0;
    const maxAttempts = 5;
    const retryDelay = 3000;

    while (attempts < maxAttempts) {
      try {
        if (!this.nc) {
          await this.connect();
        }

        const subscription = this.nc.subscribe(subject, {
          queue: "delivery-service", // Use queue group for load balancing
        });

        this.subscriptions.push(subscription);
        console.log(`Subscribed to ${subject}`);

        // Process messages
        (async () => {
          for await (const msg of subscription) {
            try {
              const data = JSON.parse(this.sc.decode(msg.data));
              await callback(data, msg);
            } catch (err) {
              console.error(`Error processing message from ${subject}:`, err);
            }
          }
        })();

        return subscription;
      } catch (error) {
        attempts++;
        console.error(`Error subscribing to ${subject} (attempt ${attempts}/${maxAttempts}):`, error);

        if (attempts >= maxAttempts) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  async publishMessage(subject, data) {
    let attempts = 0;
    const maxAttempts = 5;
    const retryDelay = 2000;

    while (attempts < maxAttempts) {
      try {
        if (!this.nc) {
          await this.connect();
        }

        this.nc.publish(subject, this.sc.encode(JSON.stringify(data)));
        console.log(`Published message to ${subject}`);
        return;
      } catch (error) {
        attempts++;
        console.error(`Error publishing message to ${subject} (attempt ${attempts}/${maxAttempts}):`, error);

        if (attempts >= maxAttempts) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
}

module.exports = new NatsConnectionManager();