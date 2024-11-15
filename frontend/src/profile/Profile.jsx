import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../Feature/Userslice";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { getAuth, updateProfile } from "firebase/auth";

function Profile() {
  const user = useSelector(selectUser);
  const [previewImage, setPreviewImage] = useState(user?.photo || "");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  console.log(user)
  useEffect(() => {
    const fetchNotificationPreference = async () => {
      try {
        const userDocRef = doc(db, "users", user?.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setNotificationsEnabled(userDoc.data().notificationsEnabled || false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchNotificationPreference();
  }, [user?.uid]);

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (window.cloudinary) {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: "djolycs3p",
          uploadPreset: "intershala",
          sources: ["local", "url", "camera"],
          showAdvancedOptions: true,
          cropping: true,
          multiple: false,
          resourceType: "image",
        },
        async (error, result) => {
          if (result.event === "success") {
            const newImageUrl = result.info.secure_url;
            setPreviewImage(newImageUrl);

            try {
              const userDocRef = doc(db, "users", user.uid);
              await updateDoc(userDocRef, {
                photo: newImageUrl,
              });

              const auth = getAuth();
              if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                  photoURL: newImageUrl,
                });
                console.log("User profile updated");
                window.location.reload();
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
    } else {
      console.error("Cloudinary widget is not defined!");
    }
  };

  const handleToggleNotification = async () => {
    const newStatus = !notificationsEnabled;
    setNotificationsEnabled(newStatus);

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        notificationsEnabled: newStatus,
      });
      console.log("Notification preference updated in Firestore");

      // Optionally, sync with Firebase Authentication
      const auth = getAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: user.name, // If needed, update other fields too.
        });
      }
    } catch (error) {
      console.error("Error updating notification preference:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center mt-9 mb-4 justify-center">
        <div className="max-w-xs">
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
                {user?.name || "User"}
              </h3>
            </div>
            <div className="text-xs my-3">
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

            <div className="text-center mt-4">
              <button
                onClick={handleImageUpload}
                className="bg-blue-500 text-white rounded-full px-4 py-2 mt-2"
              >
                Upload Profile Picture
              </button>
            </div>

            <div className="flex justify-center mt-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox text-blue-600"
                  checked={notificationsEnabled}
                  onChange={handleToggleNotification}
                />
                <span className="ml-2 text-gray-700">Enable Notifications</span>
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
