const mongoose = require('mongoose');
const dbURI = 'mongodb://localhost:27017/travlr';
const readLine = require('readline');

if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGODB_URI;
}

const connect = () => {
  setTimeout(() =>
      mongoose.connect(dbURI, {
          useNewUrlParser: true,
          useCreateIndex: true,
          useUnifiedTopology: true
      }), 1000);
}


mongoose.connection.on('connected', () => {
  console.log('connected');
});

mongoose.connection.on('error', err => {
  console.log('error: ' + err);
  return connect();
});

mongoose.connection.on('disconnected', () => {
  console.log('disconnected');
});

if (process.platform === 'win32') {
  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.on ('SIGINT', () => {
    process.emit("SIGINT");
  });
}

const gracefulShutdown = (msg, callback) => {
  mongoose.connection.close( () => {
    console.log(`Mongoose disconnected through ${msg}`);
    callback();
  });
};

process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2');
  });
});

process.on('SIGINT', () => {
  gracefulShutdown('app termination', () => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  gracefulShutdown('Heroku app shutdown', () => {
    process.exit(0);
  });
});

connect();

require('./models/travlr');
require('./models/user');
