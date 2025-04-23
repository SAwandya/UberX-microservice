const { connect, StringCodec } = require("nats");
class NatsConnectionManager {
  constructor() {
    this.nc = null;
    this.sc = StringCodec();
  }
  async connect() {
    if (!this.nc) {
      this.nc = await connect({ servers: process.env.NATS_URL });
      console.log("Connected to NATS");
    }
    return this.nc;
  }
  async subscribe(subject, callback) {
    const nc = await this.connect();
    const sub = nc.subscribe(subject);
    (async () => {
      for await (const msg of sub) {
        const data = JSON.parse(this.sc.decode(msg.data));
        callback(data);
      }
    })();
  }
}
module.exports = new NatsConnectionManager();