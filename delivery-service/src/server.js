const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const { PORT, CORS_ORIGIN } = require('./config/environment');
const tripRoutes = require('./routes/tripRoutes');
const locationRoutes = require('./routes/locationRoutes');
const errorHandler = require('./middleware/errorHandler');
const orderEventSubscriber = require('./events/subscribers/orderEventSubscriber');
const riderRoutes = require('./routes/riderRoutes');

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const app = express();
const server = http.createServer(app);

const corsOrigins = CORS_ORIGIN ? CORS_ORIGIN.split(',') : ['http://localhost:3000'];

const io = socketIo(server, {
    cors: {
        origin: corsOrigins,
        methods: ['GET', 'POST']
    }
});

app.use(express.json());

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('join_trip', (tripId) => {
        socket.join(`trip:${tripId}`);
        console.log(`Client joined trip:${tripId}`);
    });
});

app.set('io', io);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

app.use('/api/trips', tripRoutes);
app.use('/api', locationRoutes);
app.use("/api/riders", riderRoutes);

app.use(errorHandler);

const startServer = async () => {
    try {
        server.listen(PORT, () => {
            console.log(`Delivery Service running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Error subscribing to NATS events:', err);
        process.exit(1);
    }
};

startServer();