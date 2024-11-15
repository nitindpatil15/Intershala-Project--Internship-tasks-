const express = require("express");
const router = express.Router();
const application = require("../Model/Application");
const Notification = require("../Model/Notification");
const Application = require("../Model/Application");

router.post("/", async (req, res) => {
  const applicationData = new application({
    coverLetter: req.body.coverLetter,
    user: req.body.user,
    company: req.body.company,
    category: req.body.category,
    body: req.body.body,
    ApplicationId: req.body.ApplicationId,
  });
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
  const { action, firebaseUid } = req.body; // firebaseUid should be sent from the frontend

  if (!firebaseUid) {
    return res.status(400).json({ error: "Firebase UID is required" });
  }
  console.log("Working");
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

    // Create a notification with Firebase UID
    const notification = new Notification({
      userId: firebaseUid, // Store Firebase UID here
      message: `Your application has been ${status}.`,
      status: "unread",
      application: updateApplication,
      createdAt: new Date(),
    });
    await notification.save();
    
    console.log("done");
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




// const socketId = userSockets[firebaseUid];
    // if (socketId) {
    //   io.to(socketId).emit("jobStatus", {
    //     message: application.message,
    //     color: status === "accepted" ? "green" : "blue",
    //   });
    //   console.log(
    //     `Notification sent to user ${userId}: ${application.message}`
    //   );
    // }