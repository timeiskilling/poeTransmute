CREATE TYPE "public"."currency_type" AS ENUM('Currency', 'Breach', 'Abyss', 'Expedition', 'Ritual', 'Delirium', 'Runes', 'UncutGems', 'Essences', 'LineageSupportGems', 'SoulCores', 'Fragments', 'Idols');--> statement-breakpoint
CREATE TYPE "public"."stash_type" AS ENUM('UniqueWeapon', 'UniqueArmour', 'UniqueAccessory', 'UniqueFlask', 'UniqueCharm', 'UniqueJewel', 'UniqueRelic', 'UniqueTablet');--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"type" "currency_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"image" text NOT NULL,
	"category" varchar(255) NOT NULL,
	"detailsId" varchar(255) PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "currency" CASCADE;