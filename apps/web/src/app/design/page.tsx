import { notFound } from "next/navigation";
import { DesignShowcase } from "@/components/design/design-showcase";

export default function DesignPage() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_ENABLE_DESIGN_PAGE !== "true"
  ) {
    notFound();
  }

  return <DesignShowcase />;
}
