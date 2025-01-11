import Image from "next/image";
import React from "react";

function WelcomeBanner() {
  return (
    <div className="flex gap-5 items-center bg-white rounded-xl p-5">
      <Image src="/welcome.png" alt="" width={100} height={100} />
      <div className="">
        <h2 className="font-bold text-[27px]">
          Welcome to <span className="text-primary">Obstutor</span> by Obstamed
        </h2>
        <h2 className="text-gray-500">Explore, Learn and Build Real Life Biomedical Projects</h2>
      </div>
    </div>
  );
}

export default WelcomeBanner;
