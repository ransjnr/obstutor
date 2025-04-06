"use client";
import {
  BadgeIcon,
  GraduationCap,
  BookOpen,
  HelpCircle,
  LayoutGrid,
  Brain,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

function SideNav({ isCollapsed, onToggleCollapse }) {
  const { user } = useUser();
  const [collapsed, setCollapsed] = useState(isCollapsed || false);
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
    {
      id: 4,
      name: "Obstutor AI",
      icon: Brain,
      path: "/ai",
      auth: true,
    },
    // {
    //   id: 4,
    //   name: "Be Instructor",
    //   icon: GraduationCap,
    //   path: "/instructor",
    //   auth: true,
    // },
  ];

  const path = usePathname();

  // Handle collapse toggle
  const toggleCollapse = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    if (onToggleCollapse) {
      onToggleCollapse(newCollapsedState);
    }
  };

  useEffect(() => {
    setCollapsed(isCollapsed || false);
  }, [isCollapsed]);

  return (
    <div className="p-5 bg-white shadow-sm border h-screen sm:w-64 relative">
      <div className="flex justify-between items-center">
        <div className={collapsed ? "hidden" : "block"}>
          <Image src="/logo.svg" alt="logo" width={200} height={50} />
        </div>
        <button
          onClick={toggleCollapse}
          className="p-1 rounded-full hover:bg-gray-100 absolute right-2 top-5"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>

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
                  {!collapsed && <h2>{item.name}</h2>}
                </div>
              </Link>
            )
        )}
      </div>
    </div>
  );
}

export default SideNav;
