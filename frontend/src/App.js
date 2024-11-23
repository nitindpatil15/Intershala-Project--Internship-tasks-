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
import { useEffect } from "react";
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

function App() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  useEffect(() => {
      if ("Notification" in window) {
        Notification.requestPermission().then((permission) => {
          console.log(`Notification permission: ${permission}`);
        });
      }
    

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
  }, [dispatch]);
  return (
    <div className="App">
      <Navbar />
      <Sidebar userId={user?.uid}/>
      <PopupNotifications/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/internship" element={<Intern />} />
        <Route path="/Jobs" element={<JobAvl />} />
        <Route path="/profile" element={<Profile userId={user?.uid}/>} />
        <Route path="/detailjob" element={<JobDetail userId={user?.uid}/>} />
        <Route path="/detailInternship" element={<InternDeatil userId={user?.uid}/>} />
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
        <Route path="/notifications" element={<Notify/>} />
        <Route path="/resume" element={<RazorpayPayment userId={user?.uid}/>} />
        <Route path="/resume-form" element={<ResumeForm userId={user?.uid} user={user}/>} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
