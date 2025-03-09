import GlobalApi from "@/app/_utils/GlobalApi";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CourseItem from "./CourseItem";
import Link from "next/link";

function CourseList() {
  const [courseList, setCourseList] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const searchQuery = queryParams.get("search") || "";
    getAllCourses(searchQuery);
  }, [filter]);

  const getAllCourses = (searchQuery = "") => {
    GlobalApi.getAllCourseList().then((resp) => {
      let courses = resp?.courseLists || [];
      if (searchQuery) {
        courses = courses.filter((course) =>
          course.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (filter !== "all") {
        courses = courses.filter((course) =>
          filter === "free" ? course.free : !course.free
        );
      }
      setCourseList(courses);
    });
  };

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      getAllCourses();
    }
  };

  return (
    <div className="p-5 bg-white rounded-lg mt-5">
      {/* Title and Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-primary">All Courses</h2>
        <Select onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="free">Free</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Display Course List */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {courseList?.length > 0
          ? courseList.map((item, index) => (
              <Link href={"/course-preview/" + item.slug} key={index}>
                <div key={index}>
                  <CourseItem course={item} />
                </div>
              </Link>
            ))
          : [1, 2, 3, 4, 5, 6, 7].map((item, index) => (
              <div
                key={index}
                className="w-full h-[240px] rounded-xl m-2 bg-slate-200 animate-pulse"
              ></div>
            ))}
      </div>
    </div>
  );
}

export default CourseList;
