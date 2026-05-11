"use client"

import { motion } from "framer-motion"
import {
  Bell,
  CreditCard,
  Lock,
  LogOut,
  Mail,
  Palette,
  Settings,
  Shield,
  Sparkles,
  Trash2,
  User,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function AjustesPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-neu-cream pt-40 pb-16">
        <div
          className="absolute inset-0 opacity-10 z-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 0, transparent 10px)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 lg:px-16 space-y-8">
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neu-yellow border-[4px] border-neu-black p-6 md:p-8"
            style={{ boxShadow: "10px 10px 0px 0px #000" }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div
                  className="bg-neu-black p-3 border-[3px] border-white"
                  style={{ boxShadow: "4px 4px 0px 0px #000" }}
                >
                  <Settings className="w-8 h-8 text-neu-yellow" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-black uppercase italic text-neu-black">
                    Ajustes
                  </h1>
                  <p className="text-sm md:text-base font-bold uppercase text-neu-black/80">
                    Control total de tu cuenta, seguridad y preferencias
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className="bg-neu-black text-neu-yellow px-5 py-3 font-black uppercase text-xs border-[3px] border-neu-black"
                  style={{ boxShadow: "4px 4px 0px 0px #000" }}
                >
                  Guardar cambios
                </button>
                <button
                  className="bg-white text-neu-black px-5 py-3 font-black uppercase text-xs border-[3px] border-neu-black"
                  style={{ boxShadow: "4px 4px 0px 0px #000" }}
                >
                  Vista previa
                </button>
              </div>
            </div>
          </motion.header>

          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
            <aside className="space-y-4">
              <div
                className="bg-neu-pink border-[3px] border-neu-black p-5"
                style={{ boxShadow: "6px 6px 0px 0px #000" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-5 h-5" />
                  <p className="font-black uppercase text-sm">Centro de ajustes</p>
                </div>
                <p className="font-bold text-sm text-neu-black/80">
                  Personaliza tu experiencia, controla alertas y protege tu cuenta.
                </p>
              </div>

              <div
                className="bg-white border-[3px] border-neu-black p-5 space-y-3"
                style={{ boxShadow: "6px 6px 0px 0px #000" }}
              >
                {[
                  { label: "Perfil", icon: User },
                  { label: "Notificaciones", icon: Bell },
                  { label: "Seguridad", icon: Shield },
                  { label: "Facturación", icon: CreditCard },
                  { label: "Apariencia", icon: Palette },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-3 px-3 py-2 border-[2px] border-neu-black bg-neu-cream font-bold uppercase text-xs"
                    style={{ boxShadow: "3px 3px 0px 0px #000" }}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </aside>

            <section className="space-y-6">
              <div
                className="bg-white border-[3px] border-neu-black p-6"
                style={{ boxShadow: "6px 6px 0px 0px #000" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <User className="w-5 h-5" />
                  <h2 className="font-black uppercase text-lg">Perfil</h2>
                  <span className="bg-neu-lime px-2 py-1 text-xs font-black border-2 border-neu-black">
                    PRO
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-bold uppercase text-xs">Nombre completo</label>
                    <Input placeholder="Lucas Calavia" className="border-[3px] border-neu-black" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold uppercase text-xs">Correo</label>
                    <Input placeholder="lucas@email.com" className="border-[3px] border-neu-black" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold uppercase text-xs">Usuario</label>
                    <Input placeholder="@lucas" className="border-[3px] border-neu-black" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold uppercase text-xs">Zona horaria</label>
                    <Select>
                      <SelectTrigger className="border-[3px] border-neu-black">
                        <SelectValue placeholder="Europa/Madrid" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="europe-madrid">Europa/Madrid</SelectItem>
                        <SelectItem value="america-bogota">America/Bogotá</SelectItem>
                        <SelectItem value="america-mexico">America/México</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="font-bold uppercase text-xs">Bio</label>
                  <Textarea
                    placeholder="Cuéntanos qué estás optimizando hoy..."
                    className="border-[3px] border-neu-black min-h-[120px]"
                  />
                </div>
              </div>

              <div
                className="bg-neu-cyan border-[3px] border-neu-black p-6"
                style={{ boxShadow: "6px 6px 0px 0px #000" }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Bell className="w-5 h-5" />
                  <h2 className="font-black uppercase text-lg">Comunicaciones por correo</h2>
                </div>
                <p className="font-bold text-xs text-neu-black/80 mb-5">
                  Elige qué emails quieres recibir. Si activas un toggle, daremos de alta tu correo en esa lista.
                </p>

                <div className="space-y-4">
                  {[
                    {
                      title: "Alertas de renovación",
                      description: "Te avisamos por email 5 días antes de cada cobro.",
                    },
                    {
                      title: "Recomendaciones IA",
                      description: "Emails con oportunidades de ahorro y optimización.",
                    },
                    {
                      title: "Novedades del producto",
                      description: "Lanzamientos y mejoras del dashboard.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between gap-4 bg-white/80 border-[3px] border-neu-black p-4"
                      style={{ boxShadow: "4px 4px 0px 0px #000" }}
                    >
                      <div>
                        <p className="font-black uppercase text-sm">{item.title}</p>
                        <p className="font-bold text-xs text-neu-black/80">{item.description}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="bg-white border-[3px] border-neu-black p-6"
                style={{ boxShadow: "6px 6px 0px 0px #000" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <Shield className="w-5 h-5" />
                  <h2 className="font-black uppercase text-lg">Seguridad</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-bold uppercase text-xs">Contraseña actual</label>
                    <Input type="password" placeholder="••••••••" className="border-[3px] border-neu-black" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold uppercase text-xs">Nueva contraseña</label>
                    <Input type="password" placeholder="••••••••" className="border-[3px] border-neu-black" />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 bg-neu-cream border-[3px] border-neu-black p-4"
                  style={{ boxShadow: "4px 4px 0px 0px #000" }}
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5" />
                    <div>
                      <p className="font-black uppercase text-sm">Doble factor (2FA)</p>
                      <p className="font-bold text-xs text-neu-black/80">Protege tu cuenta con un segundo paso.</p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>

              <div
                className="bg-neu-orange border-[3px] border-neu-black p-6"
                style={{ boxShadow: "6px 6px 0px 0px #000" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <CreditCard className="w-5 h-5" />
                  <h2 className="font-black uppercase text-lg">Facturación</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-bold uppercase text-xs">Plan actual</label>
                    <Select>
                      <SelectTrigger className="border-[3px] border-neu-black">
                        <SelectValue placeholder="Pro mensual" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="pro">Pro mensual</SelectItem>
                        <SelectItem value="business">Business anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold uppercase text-xs">Método de pago</label>
                    <Input placeholder="Visa •••• 4242" className="border-[3px] border-neu-black" />
                  </div>
                </div>

                <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/90 border-[3px] border-neu-black p-4"
                  style={{ boxShadow: "4px 4px 0px 0px #000" }}
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <div>
                      <p className="font-black uppercase text-sm">Factura automática</p>
                      <p className="font-bold text-xs text-neu-black/80">Se envía a lucas@email.com</p>
                    </div>
                  </div>
                  <button
                    className="bg-neu-black text-neu-yellow px-4 py-2 font-black uppercase text-xs border-[3px] border-neu-black"
                    style={{ boxShadow: "3px 3px 0px 0px #000" }}
                  >
                    Actualizar correo
                  </button>
                </div>
              </div>

              <div
                className="bg-white border-[3px] border-neu-black p-6"
                style={{ boxShadow: "6px 6px 0px 0px #000" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <Palette className="w-5 h-5" />
                  <h2 className="font-black uppercase text-lg">Apariencia</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-bold uppercase text-xs">Tema</label>
                    <Select>
                      <SelectTrigger className="border-[3px] border-neu-black">
                        <SelectValue placeholder="Claro neubrutal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro neubrutal</SelectItem>
                        <SelectItem value="dark">Oscuro neón</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold uppercase text-xs">Densidad</label>
                    <Select>
                      <SelectTrigger className="border-[3px] border-neu-black">
                        <SelectValue placeholder="Compacta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compacta</SelectItem>
                        <SelectItem value="comfortable">Cómoda</SelectItem>
                        <SelectItem value="spacious">Amplia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div
                className="bg-neu-pink border-[3px] border-neu-black p-6"
                style={{ boxShadow: "6px 6px 0px 0px #000" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <Trash2 className="w-5 h-5" />
                  <h2 className="font-black uppercase text-lg">Zona de riesgo</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <button
                    className="flex-1 bg-neu-black text-neu-yellow px-4 py-3 font-black uppercase text-xs border-[3px] border-neu-black"
                    style={{ boxShadow: "4px 4px 0px 0px #000" }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión en todos los dispositivos
                    </span>
                  </button>
                  <button
                    className="flex-1 bg-white text-neu-black px-4 py-3 font-black uppercase text-xs border-[3px] border-neu-black"
                    style={{ boxShadow: "4px 4px 0px 0px #000" }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Eliminar cuenta
                    </span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
