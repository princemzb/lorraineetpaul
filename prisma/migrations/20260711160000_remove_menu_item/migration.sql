-- Seule la Soirée propose un choix de menu : le modèle MenuItem
-- (menus des cérémonies Civil / Religieux / Vin d'Honneur) devient inutile.

-- Retire la référence au menu simple sur les invitations
ALTER TABLE "Invitation" DROP CONSTRAINT IF EXISTS "Invitation_menuItemId_fkey";
ALTER TABLE "Invitation" DROP COLUMN IF EXISTS "menuItemId";

-- Supprime la table des menus simples
DROP TABLE IF EXISTS "MenuItem";
