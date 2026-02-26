# Sistema de 3 tipos de usuarios

## 1. Admin

- **Creación:** El admin por defecto es **admin@gmail.com**. Para asignarlo:
  1. Si aún no existe, regístrate en `/registro` con el correo **admin@gmail.com** y una contraseña.
  2. En Supabase Dashboard → **SQL Editor** ejecuta el archivo `supabase/seed-admin.sql` (o el contenido siguiente):
     ```sql
     UPDATE public.profiles
     SET role = 'admin', updated_at = now()
     WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@gmail.com');
     ```
  A partir de ahí ese usuario puede entrar en `/login` y acceder a `/admin`.

- **Alternativa** (cualquier otro correo como admin): después de registrarte, ejecuta en SQL:
  ```sql
  UPDATE profiles SET role = 'admin' WHERE id = 'TU_USER_ID_AQUI';
  ```
  (El `id` es el UUID del usuario en Authentication → Users.)

- **Qué puede hacer:**
  - Dashboard en `/admin` (resumen de perfiles y ciudades).
  - CRUD **usuarios registrados** en `/admin/usuarios`: crear y editar perfiles de escort (nombre, edad, ciudad, badge, imagen, disponible, descripción, zona, horario, WhatsApp). Solo el admin puede crear y borrar estos perfiles.
  - CRUD **ciudades** en `/admin/ciudades`: slug, nombre, imagen, contenido SEO (keyword_primary, seo_title, seo_description, seo_content).
  - **Dar acceso de login** a un perfil de escort: por ahora no está implementado en el front. Para que un “usuario registrado” pueda entrar y editar su perfil, hace falta una Edge Function en Supabase que, con la service role, cree el usuario en Auth y actualice `escort_profiles.user_id` y `profiles.role = 'registered_user'`. Ver sección “Dar acceso” más abajo.

## 2. Usuario registrado (escort con acceso)

- **Creación:** El admin crea el perfil en `/admin/usuarios`. Para dar acceso de login, el admin debe ejecutar la Edge Function “create-escort-user” (o equivalente) con el `id` del perfil, email y contraseña temporal. Esa función:
  - Crea el usuario en `auth.users` (Supabase Admin API).
  - Inserta/actualiza `profiles` con `role = 'registered_user'`.
  - Actualiza `escort_profiles` poniendo `user_id = nuevo_user_id` en el perfil correspondiente.

- **Qué puede hacer:**
  - Iniciar sesión en `/login` con el correo y contraseña que le pasó el admin.
  - En `/cuenta` puede ver y editar **solo su** perfil público (nombre, edad, badge, imagen, disponible, descripción, zona, horario, WhatsApp).

## 3. Visitante

- **Creación:** Se registra en `/registro` (nombre de usuario, edad, ciudad opcional, correo y contraseña). Se crea un usuario en Auth y, por trigger, una fila en `profiles` con `role = 'visitor'` y los datos que envió.

- **Qué puede hacer:**
  - Iniciar sesión en `/login`.
  - En `/mi-perfil` puede ver y editar su perfil básico: nombre de usuario, foto de perfil (URL), edad.

---

## Dar acceso a un usuario registrado (escort)

Hace falta una **Edge Function** en Supabase que use la **service role** para:

1. Crear el usuario en Auth: `auth.admin.createUser({ email, password })`.
2. Insertar en `profiles` con `role = 'registered_user'` (o actualizar si el trigger ya creó la fila como visitor).
3. Actualizar `escort_profiles` set `user_id = nuevo_user_id` where `id = escort_profile_id`.

Desde el front (admin) se puede tener un botón “Dar acceso” que llame a esa Edge Function pasando el id del perfil, email y contraseña temporal. El escort luego puede cambiar su contraseña desde Supabase Auth (recuperar contraseña) o desde una pantalla “Cambiar contraseña” si la añades.

---

## Rutas

| Ruta            | Quién                    | Descripción                          |
|-----------------|--------------------------|--------------------------------------|
| `/`             | Público                  | Home                                 |
| `/:citySlug`    | Público                  | Página ciudad                        |
| `/perfil/:id`   | Público                  | Perfil público de un escort          |
| `/login`        | No logueado              | Iniciar sesión                       |
| `/registro`     | No logueado              | Registro visitante                   |
| `/mi-perfil`    | Visitante                | Perfil básico del visitante          |
| `/cuenta`       | Usuario registrado       | Editar perfil público del escort     |
| `/admin`        | Admin                    | Dashboard                            |
| `/admin/usuarios` | Admin                  | CRUD usuarios registrados (perfiles) |
| `/admin/ciudades` | Admin                  | CRUD ciudades                        |

---

## Migraciones

En `supabase/migrations/`:

1. `20260224000000_create_cities_seo.sql` – tabla `cities` y políticas de lectura.
2. `20260224000001_create_profiles_and_escort_profiles.sql` – `profiles`, `escort_profiles`, trigger para nuevo usuario.
3. `20260224000002_cities_admin_policies.sql` – políticas para que admin pueda INSERT/UPDATE/DELETE en `cities`.

Ejecutar en orden al levantar el proyecto en Supabase (o con `supabase db push`).
