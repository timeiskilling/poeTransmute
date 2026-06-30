CREATE TYPE "public"."item_type" AS ENUM('Currency', 'Breach', 'Abyss', 'Expedition', 'Ritual', 'Delirium', 'Runes', 'UncutGems', 'Essences', 'LineageSupportGems', 'SoulCores', 'Fragments', 'Idols', 'UniqueWeapon', 'UniqueArmour', 'UniqueAccessory', 'UniqueFlask', 'UniqueCharm', 'UniqueJewel', 'UniqueRelic', 'UniqueTablet');--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "type" SET DATA TYPE "public"."item_type" USING "type"::text::"public"."item_type";--> statement-breakpoint
DROP TYPE "public"."currency_type";--> statement-breakpoint
DROP TYPE "public"."stash_type";