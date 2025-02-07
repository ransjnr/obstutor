import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import React from "react";

function WelcomeBanner() {
  const { user } = useUser();
  return (
    <div className="flex gap-5 items-center bg-white rounded-xl p-5">
      <Image src="/welcome.png" alt="" width={100} height={100} />
      <div className="">
        <h2 className="font-bold text-[27px]">
          Welcome back <span className="text-primary"> {user?.fullName}</span>
        </h2>
        <h2 className="text-gray-500">
          Let's begin learning where you left off. Good luck!
        </h2>
      </div>
    </div>
  );
}

export default WelcomeBanner;
