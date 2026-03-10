-- Extras VIP para perfiles con promoción "destacada" (VIP).
-- Valores: marco_premium, foto_xl, etiqueta_disponible_ahora, incluir_galeria
ALTER TABLE escort_profiles
  ADD COLUMN IF NOT EXISTS vip_extras text[] DEFAULT '{}';

COMMENT ON COLUMN escort_profiles.vip_extras IS 'Extras VIP: marco_premium, foto_xl, etiqueta_disponible_ahora, incluir_galeria';
