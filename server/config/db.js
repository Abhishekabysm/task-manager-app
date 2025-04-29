const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.error('MONGO_URI not found in environment variables.');
      process.exit(1); // Exit process with failure
    }

    await mongoose.connect(mongoURI, {
      // useNewUrlParser: true, // Deprecated options, no longer needed
      // useUnifiedTopology: true,
      // useCreateIndex: true, // Not supported
      // useFindAndModify: false // Not supported
    });

    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
