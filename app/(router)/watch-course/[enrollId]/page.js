"use client";

import GlobalApi from "@/app/_utils/GlobalApi";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import CourseVideoDescription from "../../course-preview/[courseId]/_components/CourseVideoDescription";
import CourseContentSection from "../../course-preview/[courseId]/_components/CourseContentSection";

function WatchCourse({ params }) {
  const { user } = useUser();
  const [enrollId, setEnrollId] = useState(null);
  const [courseInfo, setCourseInfo] = useState();
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  useEffect(() => {
    // Unwrap the params promise
    params
      .then((resolvedParams) => {
        setEnrollId(resolvedParams.enrollId);
      })
      .catch((error) => {
        console.error("Error unwrapping params:", error);
      });
  }, [params]);

  useEffect(() => {
    if (enrollId && user) {
      getUserEnrolledCourseDetail();
    }
  }, [enrollId, user]);

  /**
   * Get user Enrolled Course Details by Id+Email
   */
  const getUserEnrolledCourseDetail = () => {
    GlobalApi.getUserEnrolledCourseDetails(
      enrollId,
      user.primaryEmailAddress.emailAddress
    ).then((resp) => {
      setCourseInfo(resp.userEnrollCourses[0].courseList);
    });
  };

  return (
    courseInfo && (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 p-5 gap-3">
          {/* Title, Video Desciption */}
          <div className="col-span-2 bg-white p-3">
            <CourseVideoDescription
              courseInfo={courseInfo}
              activeChapterIndex={activeChapterIndex}
              watchMode={true}
            />
          </div>

          {/* Course Content */}
          <div>
            <CourseContentSection
              courseInfo={courseInfo}
              isUserAlreadyEnrolled={true}
              watchMode={true}
              setActiveChapterIndex={(index) => setActiveChapterIndex(index)}
            />
          </div>
        </div>
      </div>
    )
  );
}

export default WatchCourse;
