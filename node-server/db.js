const mongoose = require("mongoose");

module.exports = async function connection() {
    try {
        const connectionParams = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/finderai", connectionParams);
        console.log("✓ Connected to MongoDB");
    } catch (error) {
        console.error("✗ Could not connect to database:", error.message);
    }
};
