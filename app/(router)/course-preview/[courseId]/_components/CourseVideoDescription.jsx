import React, { useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  markChapterCompleted,
  sendEmailNotification,
} from "@/app/_utils/GlobalApi";
import { useUser } from "@clerk/nextjs";

function CourseVideoDescription({
  courseInfo,
  activeChapterIndex,
  watchMode = false,
  setChapterCompleted,
}) {
  const { user } = useUser();

  const handleCompletion = () => {
    const chapterId = courseInfo?.chapter[activeChapterIndex]?.id;
    if (chapterId) {
      markChapterCompleted(courseInfo.id, chapterId).then(() => {
        setChapterCompleted(chapterId);
        // Add notification for chapter completion
        setNotifications((prev) => [
          ...prev,
          { id: Date.now(), message: "Chapter completed!" },
        ]);
      });
    }
  };

  useEffect(() => {
    // Send email notification for new courses
    if (courseInfo && !watchMode && user) {
      sendEmailNotification(
        user.email,
        `New course available: ${courseInfo.name}`
      );
    }
  }, [courseInfo, watchMode, user]);

  return (
    <div>
      <h2 className="text-[20px] font-semibold">{courseInfo.name}</h2>
      <h2 className="text-gray-500 text-[14px] mb-3">{courseInfo.author}</h2>
      {/* Video Player */}
      <VideoPlayer
        videoUrl={courseInfo?.chapter[activeChapterIndex]?.video?.url}
        poster={!watchMode ? courseInfo?.banner?.url : null}
      />
      {/*Description */}
      <h2 className="mt-5 text-[17px] font-semibold">
        {watchMode ? (
          <span className="flex justify-between items-center">
            {courseInfo?.chapter[activeChapterIndex]?.name}

            <Button onClick={handleCompletion}>Mark Completed</Button>
          </span>
        ) : (
          <span>About this course</span>
        )}
      </h2>
      {watchMode ? (
        <Markdown className="text-[14px] font-light mt-2 leading-6">
          {courseInfo?.chapter[activeChapterIndex]?.shortDesc}
        </Markdown>
      ) : (
        <Markdown className="text-[14px] font-light mt-2 leading-6">
          {courseInfo.description}
        </Markdown>
      )}
    </div>
  );
}

export default CourseVideoDescription;
