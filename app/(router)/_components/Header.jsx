"use client";

import { BellDot, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getNotifications,
  markNotificationAsRead,
} from "@/app/_utils/GlobalApi";

function Header() {
  const { user, isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Fetch notifications from the API
    getNotifications().then((data) => setNotifications(data));
  }, []);

  const hasNotifications = notifications.length > 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${searchQuery}`);
    }
  };

  const handleNotificationClick = (id) => {
    markNotificationAsRead(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setShowDropdown((prev) => !prev);
  };

  return (
    <div className="p-4 bg-white flex justify-between">
      {/* Search bar */}
      <form
        onSubmit={handleSearch}
        className="flex gap-2 border rounded-md p-2"
      >
        <Search className="h-5 w-5" />
        <input
          type="text"
          placeholder="Search for courses"
          className="outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>
      {/* Get started Button & Bell Icon */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <BellDot
            className="text-gray-500 cursor-pointer focus:outline-none"
            onClick={toggleDropdown}
          />
          {hasNotifications && (
            <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
          )}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg">
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="p-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    {notification.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {isLoaded && user ? (
          <UserButton afterSwitchSessionUrl="/courses" />
        ) : (
          <Link href={"sign-in"}>
            <Button>Get Started</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Header;
