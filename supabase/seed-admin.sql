-- Ejecutar en Supabase Dashboard → SQL Editor
-- Asigna el rol admin al usuario con email admin@gmail.com
-- (El usuario debe existir en Authentication → Users; si no, regístrate antes en /registro con ese correo.)

UPDATE public.profiles
SET role = 'admin', updated_at = now()
WHERE id = (SELECT id FROM auth.users WHERE email = 'ada@gmail.com');

-- Verificar: debería devolver 1 fila con role = 'admin'
-- SELECT id, role, display_name FROM public.profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@gmail.com');
