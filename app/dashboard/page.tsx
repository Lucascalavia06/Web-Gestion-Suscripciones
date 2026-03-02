import type { Metadata } from "next"
import { UserProfile } from "@/components/user-profile"
import DashboardAnalytics from "@/components/dashboard-analytics"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Panel de control",
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-4xl mx-auto">
        <UserProfile />
        <DashboardAnalytics />
      </div>
    </div>
  )
}