import React, { useState } from "react";
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, provider } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const Register = () => {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const db = getFirestore(); // Initialize Firestore
  let navigate = useNavigate();

  // Function for Google Sign-in
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
        status:"free",
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

  // Function for Email/Password Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;

      // Save Email/Password user to Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        firstName: fname,
        lastName: lname,
        email: user.email,
        status:"free",
        uid: user.uid,
      });

      toast.success("Registration Successful");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Registration Failed");
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-200 p-4">
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
      </div>
    </div>
  );
};

export default Register;
