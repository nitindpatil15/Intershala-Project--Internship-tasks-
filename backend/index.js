const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { connect } = require("./db"); // Ensure the database connection file is correctly imported
const router = require("./Routes/index");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
  },
});
const port = 5000;

// Initialize Firebase Admin
const serviceAccountPath = path.resolve("config/firebase-service-account.json");

try {
  const serviceAccount = require(serviceAccountPath);
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialized");
  }
} catch (error) {
  console.error(
    `Error loading Firebase service account: ${serviceAccountPath}`,
    error
  );
  process.exit(1); // Exit the application if Firebase is not properly configured
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json());

// Razorpay instance
const razorpay = new Razorpay({
  key_id: "rzp_test_tFxlKEUb9rotlU", // Replace with Razorpay Key ID
  key_secret: "0SoRUNavpnk0qs8Ck0hwOFZc", // Replace with Razorpay Key Secret
});

// Routes
app.get("/", (req, res) => {
  res.send("Hello, This is My Backend");
});
app.use("/api", router); // Ensure your routes are properly configured
connect(); // Ensure your DB connection is correctly established

// Razorpay Payment: Create Order
app.post("/api/payment", async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }

  try {
    const response = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: "INR",
      payment_capture: 1,
    });

    res.json({
      key: "rzp_test_tFxlKEUb9rotlU", // Public Key for frontend
      amount: response.amount,
      currency: response.currency,
      orderId: response.id,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).send("Error creating payment order");
  }
});

// Razorpay Payment: Verify Payment
app.post("/api/payment/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, uid } =
    req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !uid
  ) {
    return res.status(400).json({ error: "Invalid request parameters" });
  }

  // Generate signature for verification
  const generatedSignature = crypto
    .createHmac("sha256", "0SoRUNavpnk0qs8Ck0hwOFZc") // Replace with Razorpay Key Secret
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature === razorpay_signature) {
    try {
      // Update Firestore user status
      const db = admin.firestore();
      const userRef = db.collection("users").doc(uid);

      await userRef.update({
        status: "prime",
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating Firestore:", error);
      res.status(500).send("Error updating user status");
    }
  } else {
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
});

// Socket.IO Connection
const userSockets = {}; // Store active user sockets

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for user login and map their socket
  socket.on("registerUser", (userId) => {
    userSockets[userId] = socket.id;
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    for (const [userId, socketId] of Object.entries(userSockets)) {
      if (socketId === socket.id) {
        delete userSockets[userId];
        console.log(`User ${userId} disconnected.`);
      }
    }
  });
});

// Handle missing routes
app.use((req, res) => {
  res.status(404).send("Route not found");
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
