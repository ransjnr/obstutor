"use client";
import {
  BadgeIcon,
  GraduationCap,
  BookOpen,
  HelpCircle,
  LayoutGrid,
} from "lucide-react";
import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

function SideNav() {
  const { user } = useUser();
  const menu = [
    {
      id: 0,
      name: "Dashboard",
      icon: LayoutGrid,
      path: "/dashboard",
      auth: user,
    },
    {
      id: 1,
      name: "All Courses",
      icon: BookOpen,
      path: "/courses",
      auth: true,
    },
    {
      id: 3,
      name: "Membership",
      icon: BadgeIcon,
      path: "/membership",
      auth: true,
    },
    // {
    //   id: 4,
    //   name: "Be Instructor",
    //   icon: GraduationCap,
    //   path: "/instructor",
    //   auth: true,
    // },
    // {
    //   id: 5,
    //   name: "AI Assistant",
    //   icon: HelpCircle,
    //   path: "/ai",
    //   auth: true,
    // },
  ];

  const path = usePathname();
  useEffect(() => {
    console.log("Path", path);
  }, []);
  return (
    <div className="p-5 bg-white shadow-sm border h-screen">
      <Image src="/logo.svg" alt="logo" width={200} height={50} />
      <hr className="mt-3"></hr>
      <div className="mt-5">
        {menu.map(
          (item, index) =>
            item.auth && (
              <Link href={item.path} key={index}>
                <div
                  className={`group flex gap-3 mt-1 p-3 text-[20px] items-center text-gray-500 cursor-pointer hover:bg-primary hover:text-white rounded-md transition-all ease-in-out duration-200 ${
                    path.includes(item.path) && "bg-primary text-white"
                  }`}
                >
                  <item.icon className="group-hover:animate-bounce" />
                  <h2>{item.name}</h2>
                </div>
              </Link>
            )
        )}
      </div>
    </div>
  );
}

export default SideNav;
