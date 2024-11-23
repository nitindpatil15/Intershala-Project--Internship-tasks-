import React, { useState, useEffect } from "react";
import axios from "axios";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const ResumeForm = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    qualification: "",
    experience: "",
    about: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    portfolio: "",
    skills: "",
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user data from Firestore when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDocRef = doc(getFirestore(), "users", userId);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          setUser(userSnapshot.data());
        } else {
          console.error("User not found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload the photo to the server
      const photoFormData = new FormData();
      photoFormData.append("photo", photo);

      const photoResponse = await axios.post(
        "http://localhost:5000/api/resume/upload-photo",
        photoFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const photoUrl = photoResponse.data.photoUrl;

      // Save resume data to the backend
      await axios.post("http://localhost:5000/api/resume/save-resume", {
        userId,
        resumeData: { ...formData, photoUrl },
      });

      alert("Resume generated and saved to your profile successfully!");
    } catch (error) {
      console.error("Error generating resume:", error);
      alert("Failed to generate the resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle non-premium users
  if (user && user.status !== "prime") {
    return (
      <div className="text-center text-red-500">
        This feature is available only for premium users. Please upgrade to
        access this feature.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto bg-white shadow-lg p-6 rounded-md"
    >
      <h2 className="text-lg font-bold mb-4">Create Your Resume</h2>

      <div className="mb-4">
        <label className="block text-gray-700">Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Phone:</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Qualification:</label>
        <input
          type="text"
          name="qualification"
          value={formData.qualification}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Experience:</label>
        <input
          type="text"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">About:</label>
        <textarea
          name="about"
          value={formData.about}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        ></textarea>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">LinkedIn Profile:</label>
        <input
          type="url"
          name="linkedin"
          value={formData.linkedin}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">GitHub Profile:</label>
        <input
          type="url"
          name="github"
          value={formData.github}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Portfolio Link:</label>
        <input
          type="url"
          name="portfolio"
          value={formData.portfolio}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Skills (Comma Separated):</label>
        <input
          type="text"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Photo:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
      >
        {loading ? "Generating..." : "Generate Resume"}
      </button>
    </form>
  );
};

export default ResumeForm;
