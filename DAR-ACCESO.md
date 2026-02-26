# Dar acceso de login a un usuario registrado (escort)

Para que Andrea (o cualquier perfil de escort) pueda entrar en /login y editar su perfil en /cuenta:

## 1. Desplegar la Edge Function (una sola vez)

En la carpeta del proyecto (donde está la carpeta `supabase/`), con [Supabase CLI](https://supabase.com/docs/guides/cli) instalada:

```bash
npx supabase login
npx supabase link   # elige tu proyecto
npx supabase functions deploy create-escort-user
```

`supabase/config.toml` tiene `verify_jwt = false` para esta función para evitar 401 con las nuevas JWT Signing Keys; la función sigue validando el token y el rol admin por dentro.

La función usa `SUPABASE_SERVICE_ROLE_KEY`, que ya está en tu proyecto de Supabase (no hace falta configurar nada más).

## 2. Dar acceso desde el admin

1. Entra como admin en **/admin** → **Usuarios registrados**.
2. Busca el perfil de **Andrea** (o el que quieras).
3. Si en la columna "Acceso" sale **No**, haz clic en el botón **Dar acceso**.
4. En el cuadro que se abre, indica:
   - **Correo:** el que usará Andrea para entrar (ej. andrea@ejemplo.com).
   - **Contraseña temporal:** una contraseña de al menos 6 caracteres (se la pasas a Andrea por un canal seguro).
5. Pulsa **Crear cuenta y dar acceso**.

Listo: ese perfil queda vinculado a la cuenta. La columna "Acceso" pasará a **Sí**.

## 3. Indicar a Andrea cómo entrar

- **URL:** la de tu app + `/login` (ej. https://puntocachero.cl/login).
- **Correo:** el que pusiste en el paso anterior.
- **Contraseña:** la temporal que configuraste (puede cambiarla después con "¿Olvidaste tu contraseña?" si tienes el correo de recuperación activo).

Después de entrar, puede ir a **/cuenta** para editar su perfil (fotos, descripción, horario, WhatsApp, etc.).
