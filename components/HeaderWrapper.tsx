"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function HeaderWrapper(props: React.ComponentProps<typeof Header>) {
  const router = useRouter();

  const handleNavigate = (href: string) => {
    // allow absolute or relative
    void router.push(href);
  };

  return <Header {...props} onNavigate={handleNavigate} />;
}
