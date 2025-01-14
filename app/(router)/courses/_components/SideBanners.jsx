import GlobalApi from "@/app/_utils/GlobalApi";
import Image from "next/image";
import React, { useEffect, useState } from "react";

function SideBanners() {
  const [sideBannerList, setSideBannerList] = useState([]);
  useEffect(() => {
    getSideBanners();
  }, []);
  const getSideBanners = () => {
    GlobalApi.getSideBanner().then((resp) => {
      console.log(resp);
      setSideBannerList(resp.sideBanners);
    });
  };
  return (
    <div>
      {sideBannerList?.length > 0
        ? sideBannerList.map((item, index) => (
            <div key={index}>
              <Image
                src={item.banner.url}
                alt="banner"
                width={500}
                height={300}
                onClick={() => window.open(item.url, "_blank")}
                className="p-1 rounded-xl cursor-pointer"
              />
            </div>
          ))
        : [1, 2, 3].map((item, index) => (
            <div
              key={index}
              className="w-full h-[240px] rounded-xl m-2 bg-slate-200 animate-pulse"
            ></div>
          ))}
    </div>
  );
}

export default SideBanners;
