-- CreateTable: ai_provider_configs
CREATE TABLE "ai_provider_configs" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "api_key" TEXT,
    "base_url" TEXT,
    "default_model" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "org_id" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_provider_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX "ai_provider_configs_user_id_idx" ON "ai_provider_configs"("user_id");
CREATE INDEX "ai_provider_configs_org_id_idx" ON "ai_provider_configs"("org_id");
CREATE UNIQUE INDEX "ai_provider_configs_provider_user_id_key" ON "ai_provider_configs"("provider", "user_id");

-- AddForeignKey
ALTER TABLE "ai_provider_configs" ADD CONSTRAINT "ai_provider_configs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_provider_configs" ADD CONSTRAINT "ai_provider_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
