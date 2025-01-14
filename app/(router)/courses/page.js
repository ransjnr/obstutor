"use client";

import React from "react";
import WelcomeBanner from "./_components/WelcomeBanner";
import CourseList from "./_components/CourseList";
import SideBanners from "./_components/SideBanners";

function Courses() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 p-5 gap-5">
      {/* Left container */}
      <div className="col-span-3">
        <WelcomeBanner />

        {/* Course List */}
        <CourseList />
      </div>
      {/* right container */}
      <div className="p-5 bg-white rounded-xl">
        <SideBanners />
      </div>
    </div>
  );
}

export default Courses;
