import { BadgeIcon, GraduationCap, BookOpen, HelpCircle } from "lucide-react";
import React from "react";
import Image from "next/image";

function SideNav() {
  const menu = [
    {
      id: 1,
      name: "All Courses",
      icon: BookOpen,
    },
    {
      id: 2,
      name: "Membership",
      icon: BadgeIcon,
    },
    {
      id: 3,
      name: "Be Instructor",
      icon: GraduationCap,
    },
    {
      id: 4,
      name: "AI Assistant",
      icon: HelpCircle,
    },
  ];
  return (
    <div className="p-5 bg-white shadow-sm border h-screen">
      <Image src="/logo.svg" alt="logo" width={200} height={50} />
      <hr className="mt-3"></hr>
      <div className="mt-5">
        {menu.map((item, index) => (
          <div className="group flex gap-3 mt-1 p-3 text-[20px] items-center text-gray-500 cursor-pointer hover:bg-primary hover:text-white rounded-md transition-all ease-in-out duration-200">
            <item.icon className="group-hover:animate-bounce" />
            <h2>{item.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SideNav;
