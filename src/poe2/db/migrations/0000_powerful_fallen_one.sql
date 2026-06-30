CREATE TABLE "currency" (
	"id" uuid,
	"name" varchar(255),
	"image" text,
	"category" varchar(255),
	"detailsId" varchar(255) PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
