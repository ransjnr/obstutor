"use client";

import React, { useEffect, useState } from "react";
import CourseVideoDescription from "./_components/CourseVideoDescription";
import GlobalApi from "@/app/_utils/GlobalApi";
import CourseEnrollSection from "./_components/CourseEnrollSection";
import CourseContentSection from "./_components/CourseContentSection";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

function CoursePreview({ params }) {
  const [unwrappedParams, setUnwrappedParams] = React.useState(null);
  const [courseInfo, setCourseInfo] = useState();
  const { user } = useUser();
  const [isUserAlreadyEnrolled, setIsUserAlreadyEnrolled] = useState();
  const router = useRouter();

  React.useEffect(() => {
    Promise.resolve(params).then((resolvedParams) => {
      setUnwrappedParams(resolvedParams);
    });
  }, [params]);

  useEffect(() => {
    unwrappedParams && getCourseInfoById();
  }, [unwrappedParams]);

  useEffect(() => {
    courseInfo && user && checkUserEnrolledToCourse();
  }, [courseInfo, user]);
  /**
   * used to get course Info by Slug/ID Name
   */
  const getCourseInfoById = () => {
    GlobalApi.getCourseById(unwrappedParams?.courseId).then((res) => {
      setCourseInfo(res?.courseList);
    });
  };

  /**
   * To check user is enrolled in the course or not
   */
  const checkUserEnrolledToCourse = () => {
    GlobalApi.checkUserEnrolledToCourse(
      courseInfo.slug,
      user.primaryEmailAddress.emailAddress
    ).then((res) => {
      if (res?.userEnrollCourses[0]?.id) {
        console.log(res);
        setIsUserAlreadyEnrolled(res?.userEnrollCourses[0]?.id);
      }
    });
  };

  return (
    courseInfo && (
      <div className="grid grid-cols-1 md:grid-cols-3 p-5 gap-3">
        {/* Title, Video Desciption */}
        <div className="col-span-2 bg-white p-3">
          <CourseVideoDescription courseInfo={courseInfo} />
        </div>

        {/* Course Content */}
        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-primary mb-4"
          >
            Back to Dashboard
          </button>
          <CourseEnrollSection
            courseInfo={courseInfo}
            isUserAlreadyEnrolled={isUserAlreadyEnrolled}
          />

          <CourseContentSection
            courseInfo={courseInfo}
            isUserAlreadyEnrolled={isUserAlreadyEnrolled}
          />
        </div>
      </div>
    )
  );
}

export default CoursePreview;
