import React, { useState } from "react";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, provider } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const Register = () => {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isStudent, setStudent] = useState(true);
  const db = getFirestore(); // Initialize Firestore
  const navigate = useNavigate();

  // State for managing modal visibility and registration form
  const [showModal, setShowModal] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(true);
  const setTrueForStudent = () => setStudent(false);
  const setFalseForStudent = () => setStudent(true);

  const loginFunction = () => {
    signInWithPopup(auth, provider)
      .then(async (res) => {
        const userRef = doc(db, "users", res.user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          navigate("/");
        } else {
          alert(
            "Your account is not registered. Please contact the administrator."
          );
          signOut(auth);
        }
      })
      .catch((err) => console.error("Error during sign-in:", err));
    setShowModal(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      const user = res.user;

      // Save Google user to Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
        email: user.email,
        status: "free",
        uid: user.uid,
        photo: user.photoURL || "",
      });

      toast.success("Login Success");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Google Login Failed");
    }
  };

  const closeLogin = () => setShowModal(false);

  // Function for Email/Password Registration
  const handleRegister = async (e) => {
    e.preventDefault();

    // Check if user already exists with the given email
    const userRef = doc(db, "users", email);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      // If the user exists, prompt them to log in
      setShowModal(true);
      setShowRegisterForm(false); // Hide the registration form
    } else {
      try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;

        // Save new user to Firestore
        const newUserRef = doc(db, "users", user.uid);
        await setDoc(newUserRef, {
          firstName: fname,
          lastName: lname,
          email: user.email,
          status: "free",
          uid: user.uid,
        });

        toast.success("Registration Successful");
        navigate("/");
      } catch (err) {
        console.error(err);
        toast.error("Registration Failed");
      }
    }
  };

  return (
    <div className="w-full md:h-screen flex justify-center items-center bg-gray-200 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-center text-3xl font-bold">Register</h1>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-blue-500 text-white py-2 rounded-md mt-4"
        >
          Sign in with Google
        </button>

        {/* Registration Form */}
        {showRegisterForm && (
          <form onSubmit={handleRegister} className="mt-6">
            <div className="mb-4">
              <label
                htmlFor="fname"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                id="fname"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="lname"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lname"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={lname}
                onChange={(e) => setLname(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded-md mt-4"
            >
              Register
            </button>
          </form>
        )}
        <div className="mt-4 text-center">
          <p>
            Already have an account?{" "}
            <button
              onClick={() => setShowModal(true)}
              className="text-blue-500 font-semibold"
            >
              Login Here
            </button>
          </p>
        </div>
      </div>

      {/* Login Modal (Only shown when email exists) */}
      {showModal && (
        <div className="login">
          <button id="cross" onClick={closeLogin}>
            <i className="bi bi-x"></i>
          </button>
          <h5 id="state" className="mb-4 justify-center text-center">
            <span
              id="Sign-in"
              className={`auth-tab ${isStudent ? "active" : ""}`}
              onClick={setFalseForStudent}
            >
              Student
            </span>
            <span
              id="join-in"
              className={`auth-tab ${!isStudent ? "active" : ""}`}
              onClick={setTrueForStudent}
            >
              Employee and T&P
            </span>
          </h5>
          {isStudent ? (
            <div className="py-6">
              <p
                onClick={loginFunction}
                className="flex items-center justify-center mt-4 bg-slate-500 text-white rounded-lg hover:bg-gray-400"
              >
                Sign in with Google
              </p>
            </div>
          ) : (
            <div className="py-6">
              <p className="flex items-center justify-center mt-4 bg-slate-100 text-gray-500 rounded-lg hover:bg-gray-100">
                Sign in with Google
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Register;
