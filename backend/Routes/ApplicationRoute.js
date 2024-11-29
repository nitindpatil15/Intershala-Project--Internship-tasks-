const express = require("express");
const router = express.Router();
const application = require("../Model/Application");
const Application = require("../Model/Application");
const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");

router.post("/", async (req, res) => {
  const applicationData = new application({
    coverLetter: req.body.coverLetter,
    user: req.body.user,
    company: req.body.company,
    category: req.body.category,
    body: req.body.body,
    ApplicationId: req.body.ApplicationId,
  });
  console.log(applicationData);
  await applicationData
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      console.log(error, "not able to post the data");
    });
});

router.get("/", async (req, res) => {
  try {
    const data = await application.find();
    res.json(data).status(200);
  } catch (error) {
    console.log(err);
    res.status(404).json({ error: "Internal server error " });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await application.findById(id);
    if (!data) {
      res.status(404).json({ error: "Application is not found " });
    }
    res.json(data).status(200);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "Internal server error " });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { action, firebaseUid } = req.body;

  if (!firebaseUid) {
    return res.status(400).json({ error: "Firebase UID is required" });
  }

  let status;
  if (action === "accepted") {
    status = "accepted";
  } else if (action === "rejected") {
    status = "rejected";
  } else {
    return res.status(400).json({ error: "Invalid action" });
  }

  try {
    const updateApplication = await Application.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    if (!updateApplication) {
      return res
        .status(404)
        .json({ error: "Not able to update the application" });
    }

    const message =
      status === "accepted"
        ? "Congratulations! Your Application has been accepted."
        : "Sorry, your application has been rejected.";

    const u_id = uuidv4();
    const notificationData = {
      id: u_id,
      message,
      status,
      applicationid:id,
      read: false,
      timestamp: new Date(),
    };

    const firestore = admin.firestore();
    const userRef = firestore.collection("users").doc(firebaseUid);

    console.log(
      "Attempting to write notification to Firestore for user:",
      firebaseUid
    );
    console.log("Notification Data:", notificationData);

    try {
      await userRef.collection("notifications").add(notificationData);
      console.log("Notification successfully added to Firestore");
    } catch (err) {
      console.error("Error adding notification to Firestore:", err);
    }

    res.status(200).json({ success: true, data: updateApplication });
  } catch (error) {
    console.error(
      "Error updating application and creating notification:",
      error
    );
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
