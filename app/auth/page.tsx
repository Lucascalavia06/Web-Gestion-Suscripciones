import type { Metadata } from "next"
import { AuthForm } from "@/components/auth-form"

export const metadata: Metadata = {
  title: "Autenticación - Dashboard",
  description: "Inicia sesión o regístrate",
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-neu-pink flex items-center justify-center p-4">
      <AuthForm />
    </div>
  )
}
