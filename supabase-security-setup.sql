-- ========================================
-- HABILITAR RLS Y CREAR POLÍTICAS DE SEGURIDAD
-- ========================================

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE public.catalogo_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogo_servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogo_planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_suscripciones_contratadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membresia_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_planes_membresia ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para catálogos (lectura pública, solo admin puede escribir)
CREATE POLICY "Todos pueden leer categorías" ON public.catalogo_categorias
  FOR SELECT USING (true);

CREATE POLICY "Todos pueden leer servicios" ON public.catalogo_servicios
  FOR SELECT USING (true);

CREATE POLICY "Todos pueden leer planes" ON public.catalogo_planes
  FOR SELECT USING (true);

CREATE POLICY "Todos pueden leer planes de membresía" ON public.web_planes_membresia
  FOR SELECT USING (true);

-- 3. Políticas para suscripciones del usuario (solo propietario)
CREATE POLICY "Los usuarios ven solo sus suscripciones" 
  ON public.usuario_suscripciones_contratadas
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus suscripciones" 
  ON public.usuario_suscripciones_contratadas
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus suscripciones" 
  ON public.usuario_suscripciones_contratadas
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus suscripciones" 
  ON public.usuario_suscripciones_contratadas
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 4. Políticas para membresías (solo propietario)
CREATE POLICY "Los usuarios ven solo su membresía" 
  ON public.membresia_usuarios
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar su membresía" 
  ON public.membresia_usuarios
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Arreglar el foreign key para ON DELETE CASCADE
ALTER TABLE public.usuario_suscripciones_contratadas
  DROP CONSTRAINT IF EXISTS usuario_suscripciones_contratadas_user_id_fkey;

ALTER TABLE public.usuario_suscripciones_contratadas
  ADD CONSTRAINT usuario_suscripciones_contratadas_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- 6. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_usuario_suscripciones_user_id 
  ON public.usuario_suscripciones_contratadas(user_id);

CREATE INDEX IF NOT EXISTS idx_usuario_suscripciones_activo 
  ON public.usuario_suscripciones_contratadas(activo);

CREATE INDEX IF NOT EXISTS idx_catalogo_planes_servicio 
  ON public.catalogo_planes(id_servicio);

CREATE INDEX IF NOT EXISTS idx_catalogo_servicios_categoria 
  ON public.catalogo_servicios(id_categoria);
