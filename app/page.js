"use client";
import Image from "next/image";
import { UserButton, useUser } from "@clerk/nextjs";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    } else {
      isLoaded && router.push("/courses");
    }
  }, [user]);
  return (
    <div>
      <UserButton afterSwitchSessionUrl="/sign-in" />
    </div>
  );
}
