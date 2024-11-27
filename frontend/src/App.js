import "./App.css";
import Footer from "./Componets/Footerr/Footer";
import Home from "./Componets/Home/Home";
import Navbar from "./Componets/Navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import Register from "./Componets/auth/Register";
import Intern from "./Componets/Internships/Intern";
import JobAvl from "./Componets/Job/JobAvl";
import JobDetail from "./Componets/Job/JobDetail";
import InternDeatil from "./Componets/Internships/InternDeatil";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, selectUser } from "./Feature/Userslice";
import { useEffect, useState } from "react";
import { auth } from "./firebase/firebase";
import Profile from "./profile/Profile";
import AdminLogin from "./Admin/AdminLogin";
import Adminpanel from "./Admin/Adminpanel";
import ViewAllApplication from "./Admin/ViewAllApplication";
import Postinternships from "./Admin/Postinternships";
import DeatilApplication from "./Applications/DeatilApplication";
import UserApplicatiom from "./profile/UserApplicatiom";
import UserapplicationDetail from "./Applications/DeatilApplicationUser";
import Notify from "./Componets/notification/Notifications";
import PopupNotifications from "./Componets/notification/PopupNotification";
import Sidebar from "./Componets/Navbar/Sidebar";
import RazorpayPayment from "./Prime/RazorpayPayment";
import ResumeForm from "./Componets/resume/ResumeForm";
import { db } from "./firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";

function App() {
  const [notifications, setNotifications] = useState([]);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  // To track already displayed notifications
  const displayedNotifications = new Set();

  useEffect(() => {
    // Request notification permissions
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        console.log(`Notification permission: ${permission}`);
      });
    }

    // Real-time listener for Firestore notifications
    if (user?.uid) {
      const unsubscribe = onSnapshot(
        collection(db, `users/${user.uid}/notifications`),
        (snapshot) => {
          const newNotifications = snapshot.docs.map((doc) => ({
            _id: doc.id,
            ...doc.data(),
          }));
          setNotifications(newNotifications);
          console.log(newNotifications);

          // Trigger browser notifications for new messages
          newNotifications.forEach((notification) => {
            if (
              Notification.permission === "granted" &&
              !displayedNotifications.has(notification._id) // Avoid re-triggering
            ) {
              // Display the notification
              const browserNotification = new Notification("New Notification", {
                body: notification.message,
                icon:"https://play-lh.googleusercontent.com/8t6U6HGuMnP1DAJYpb4U_fEwVA7fgaOBJYRyfPHM5OLZllGj-8tsmJhu6Y4ikMrGpZg"
              });

              // Add event listeners for better debugging and interaction
              browserNotification.onclick = () => {
                console.log("Notification clicked");
                window.focus(); // Focus the browser tab when clicked
              };

              browserNotification.onshow = () => {
                console.log("Notification displayed");
              };

              browserNotification.onerror = (err) => {
                console.error("Notification error:", err);
              };

              browserNotification.onclose = () => {
                console.log("Notification closed");
              };

              // Mark as shown
              displayedNotifications.add(notification._id);
            }
          });
        }
      );

      return () => unsubscribe();
    }

    // Handle user authentication
    auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        dispatch(
          login({
            uid: authUser.uid,
            photo: authUser.photoURL,
            name: authUser.displayName,
            email: authUser.email,
            phoneNumber: authUser.phoneNumber,
          })
        );
      } else {
        dispatch(logout());
      }
    });
  }, [user?.uid, dispatch]);
  return (
    <div className="App">
      <Navbar />
      <Sidebar userId={user?.uid} />
      <PopupNotifications />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/internship" element={<Intern />} />
        <Route path="/Jobs" element={<JobAvl />} />
        <Route path="/profile" element={<Profile userId={user?.uid} />} />
        <Route path="/detailjob" element={<JobDetail userId={user?.uid} />} />
        <Route
          path="/detailInternship"
          element={<InternDeatil userId={user?.uid} />}
        />
        <Route path="/detailApplication" element={<DeatilApplication />} />
        <Route path="/adminLogin" element={<AdminLogin />} />
        <Route path="/adminepanel" element={<Adminpanel />} />
        <Route path="/postInternship" element={<Postinternships />} />
        <Route path="/applications" element={<ViewAllApplication />} />
        <Route
          path="/UserapplicationDetail"
          element={<UserapplicationDetail />}
        />
        <Route path="/userapplication" element={<UserApplicatiom />} />
        <Route path="/notifications" element={<Notify />} />
        <Route
          path="/resume"
          element={<RazorpayPayment userId={user?.uid} />}
        />
        <Route
          path="/resume-form"
          element={<ResumeForm userId={user?.uid} user={user} />}
        />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
