import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function DeatilApplication() {
  const [data, setData] = useState([]);
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const id = params.get("a");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://intershal-backend.onrender.com/api/application/${id}`
        );
        setData([response.data]);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching application data:", error);
      }
    };
    fetchData();
  }, [id]);

  const handleAcceptAndReject = async (id, action, firebaseUid) => {
    try {
      if (!firebaseUid) throw new Error("User not authenticated");

      const response = await axios.put(
        `https://intershal-backend.onrender.com/api/application/${id}`,
        {
          action,
          firebaseUid,
        }
      );

      const updatedApplication = data.map((app) =>
        app._id === id ? response.data.data : app
      );
      setData(updatedApplication);
    } catch (error) {
      console.error("Error updating application:", error.message);
    }
  };

  return (
    <div>
      {data.map((data) => (
        <section
          className="text-gray-600 body-font overflow-hidden"
          key={data._id}
        >
          <div className="container px-5 py-24 mx-auto">
            <div className="lg:w-4/5 mx-auto flex flex-wrap">
              <img
                alt="ecommerce"
                className="lg:w-1/2 w-full lg:h-auto h-64 object-cover rounded"
                src={data.user.photo}
              />
              <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
                <h2 className="text-sm title-font text-gray-500 tracking-widest">
                  Company name
                </h2>
                <h1 className="text-gray-900 font-bold title-font mb-1">
                  {data.company}
                </h1>
                <h2>Cover Letter</h2>
                <p className="leading-relaxed font-bold">{data.coverLetter}</p>
                {data.user?.pdfUrl ? (
                  <Link className="cursor-pointer" to={data.user?.pdfUrl}>
                    <div>
                      <h2 className="bg-black text-white p-4 rounded-xl">
                        Click to View Resume
                      </h2>
                    </div>
                  </Link>
                ) : (
                  <p>Resume Not attched</p>
                )}
                <div className="flex mt-6 pb-5 border-b-2 border-gray-100 mb-5">
                  <span className="mr-3">Application Date</span>
                  <p className="font-bold">
                    {new Date(data?.createAt).toLocaleDateString()}
                  </p>
                </div>
                <h4 className="mt-9">Applied By</h4>
                <p className="font-bold ">{data.user.displayName}</p>
                <div className="flex mt-24 justify-around">
                  {data.status !== "pending" ? (
                    <>
                      <h1 className="text-2xl">
                        Application :{" "}
                        <span className="capitalize">{data.status}</span>
                      </h1>
                    </>
                  ) : (
                    <>
                      <button
                        className="bg-blue-700 text-green-400 w-24 font-bold"
                        onClick={() =>
                          handleAcceptAndReject(
                            data._id,
                            "accepted",
                            data.user.uid
                          )
                        }
                      >
                        Accept
                      </button>
                      <button
                        className="bg-blue-700 text-red-600 w-24 font-bold"
                        onClick={() =>
                          handleAcceptAndReject(
                            data._id,
                            "rejected",
                            data.user.uid
                          )
                        }
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

export default DeatilApplication;
