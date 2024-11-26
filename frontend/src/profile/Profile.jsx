import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { getAuth, updateProfile } from "firebase/auth";

function Profile({ userId }) {
  const [user, setUser] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(userData);
          setNotificationsEnabled(userData.notificationsEnabled || false);
        } else {
          console.error("User not found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    if (user?.photo) {
      setPreviewImage(user.photo);
    }
  }, [user]);

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!window.cloudinary) {
      console.error("Cloudinary widget is not defined!");
      alert(
        "Profile picture upload feature is unavailable. Please refresh the page."
      );
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "djolycs3p",
        uploadPreset: "intershala",
        sources: ["local", "url", "camera"],
        cropping: true,
        multiple: false,
        resourceType: "image",
      },
      async (error, result) => {
        if (result.event === "success") {
          const newImageUrl = result.info.secure_url;
          setPreviewImage(newImageUrl);

          try {
            const userDocRef = doc(db, "users", userId);
            await updateDoc(userDocRef, { photo: newImageUrl });

            const auth = getAuth();
            if (auth.currentUser) {
              await updateProfile(auth.currentUser, { photoURL: newImageUrl });
              setUser((prevUser) => ({ ...prevUser, photo: newImageUrl }));
              console.log("User profile updated");
              window.location.reload()
            }
          } catch (error) {
            console.error("Error updating user profile:", error);
          }
        } else {
          console.error("Upload error:", error);
        }
      }
    );
    widget.open();
  };

  const handleNotificationToggle = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted" || notificationsEnabled) {
        setNotificationsEnabled(!notificationsEnabled);
        saveNotificationPreference(!notificationsEnabled);
      } else {
        alert("Notifications permission is required to enable notifications.");
      }
    } else {
      alert("Notifications are not supported in your browser.");
    }
  };

  const saveNotificationPreference = async (preference) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { notificationsEnabled: preference });
      console.log("Notification preference updated in Firestore.");
    } catch (error) {
      console.error("Error updating notification preference:", error);
    }
  };

  return (
    <div className="">
      <div className="flex items-center mt-9 mb-4 justify-center">
        <div className="max-w-xl">
          <div className="bg-white shadow-lg rounded-lg py-3 p-8">
            <div className="photo-wrapper p-2">
              <img
                src={previewImage || user?.photo}
                alt="Profile Preview"
                className="w-32 h-32 rounded-full mx-auto"
              />
            </div>
            <div className="p-2">
              <h3 className="text-center text-xl text-gray-900">
                {user?.displayName || "User"}
              </h3>
            </div>
            <div>
              <h3 className="text-xl font-bold">UID</h3>
              <h3 className="text-center text-lg text-gray-900">
                {user?.uid || "12345677"}
              </h3>
            </div>
            <div>
              <h3 className="text-xl font-bold">Email</h3>
              <h3 className="text-center text-xl text-gray-900">
                {user?.email || "@gmail.com"}
              </h3>
            </div>
            <div className="my-2">
              <Link
                to={user?.pdfUrl || "/resume"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl bg-blue-400 p-2 rounded-xl items-center"
              >
                {user?.pdfUrl ? "View Resume" : "No Resume Available"}
              </Link>
            </div>

            <div className="text-center mt-4">
              <button
                onClick={handleImageUpload}
                className="bg-blue-500 text-white rounded-full px-4 py-2 mt-2"
              >
                Change Profile Picture
              </button>
            </div>

            <div className="flex justify-center mt-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={handleNotificationToggle}
                  className="form-checkbox"
                />
                <span className="ml-2">Enable Notifications</span>
              </label>
            </div>
            <div className="flex justify-center mt-3">
              <Link
                to="/userapplication"
                className="relative items-center justify-start inline-block px-5 py-3 overflow-hidden font-medium transition-all bg-blue-600 rounded-full hover:bg-white group"
              >
                <span className="absolute inset-0 border-0 group-hover:border-[25px] ease-linear duration-100 transition-all border-white rounded-full"></span>
                <span className="relative w-full text-left text-white transition-colors duration-200 ease-in-out group-hover:text-blue-600">
                  View Applications
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
