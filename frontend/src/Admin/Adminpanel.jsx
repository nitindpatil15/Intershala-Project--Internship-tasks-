import React from "react";
import { Link } from "react-router-dom";
import { RiSendPlaneFill } from "react-icons/ri";
import { BsMailbox2Flag } from "react-icons/bs";
function Adminpanel() {
  return (
    <div>
      <div className="w-full overflow-hidden rounded-lg border bg-gray-50 shadow-sm lg:block">
        <div className="mx-auto flex max-w-screen-lg items-center gap-8 p-8">
          <div className="flex flex-col md:flex-row">
            <Link to="/applications" className="group flex gap-4 m-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg transition duration-100 group-hover:bg-indigo-600 group-active:bg-indigo-700 md:h-12 md:w-12">
                <BsMailbox2Flag />
              </div>

              <div>
                <div className="mb-1 font-semibold">View Applications</div>
                <p className="text-sm text-gray-500">
                  View All the Applications That you got from applicants
                </p>
              </div>
            </Link>

            <Link to={"/postJob"} className="group flex gap-4 m-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg transition duration-100 group-hover:bg-indigo-600 group-active:bg-indigo-700 md:h-12 md:w-12">
                <i className="bi bi-briefcase"></i>
              </div>

              <div>
                <div className="mb-1 font-semibold">Post Job</div>
                <p className="text-sm text-gray-500">
                  Post Jobs According to Your Requirements
                </p>
              </div>
            </Link>

            <Link to={"/postInternship"} className="group flex gap-4 m-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg transition duration-100 group-hover:bg-indigo-600 group-active:bg-indigo-700 md:h-12 md:w-12">
                <RiSendPlaneFill />
              </div>
              <div>
                <div className="mb-1 font-semibold">Post InternShips</div>
                <p className="text-sm text-gray-500">
                  Post InternShip According To Your Requirements{" "}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Adminpanel;
