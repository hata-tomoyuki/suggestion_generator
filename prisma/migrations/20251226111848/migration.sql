-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'editor', 'viewer');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('draft', 'review', 'approved', 'shared', 'archived');

-- CreateEnum
CREATE TYPE "ProposalBlockType" AS ENUM ('paragraph', 'bullet');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('open', 'resolved');

-- CreateEnum
CREATE TYPE "PdfExportStatus" AS ENUM ('queued', 'done', 'failed');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'editor',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_cards" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "pmDayRate" INTEGER NOT NULL,
    "devDayRate" INTEGER NOT NULL,
    "designDayRate" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_projects" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientContactName" TEXT,
    "clientEmail" TEXT,
    "ownerUserId" TEXT NOT NULL,
    "pmApproverUserId" TEXT NOT NULL,
    "salesApproverUserId" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'draft',
    "pmApprovedAt" TIMESTAMP(3),
    "salesApprovedAt" TIMESTAMP(3),
    "requirementsUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "templateScale" TEXT NOT NULL,
    "templateVersion" INTEGER NOT NULL DEFAULT 1,
    "rateCardVersion" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_requirements" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimate_items" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "days" DECIMAL(6,2) NOT NULL,
    "note" TEXT,
    "isOverridden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimate_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_sections" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_blocks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "blockType" "ProposalBlockType" NOT NULL,
    "blockKey" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "isOverridden" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_comments" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'open',
    "resolvedByUserId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_links" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "share_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdf_exports" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "status" "PdfExportStatus" NOT NULL DEFAULT 'queued',
    "sourceSnapshot" JSONB NOT NULL,
    "generatedByUserId" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errorMessage" TEXT,

    CONSTRAINT "pdf_exports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_orgId_idx" ON "users"("orgId");

-- CreateIndex
CREATE INDEX "rate_cards_orgId_isActive_idx" ON "rate_cards"("orgId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "rate_cards_orgId_version_key" ON "rate_cards"("orgId", "version");

-- CreateIndex
CREATE INDEX "quote_projects_orgId_status_idx" ON "quote_projects"("orgId", "status");

-- CreateIndex
CREATE INDEX "quote_projects_orgId_ownerUserId_idx" ON "quote_projects"("orgId", "ownerUserId");

-- CreateIndex
CREATE INDEX "quote_projects_orgId_pmApproverUserId_idx" ON "quote_projects"("orgId", "pmApproverUserId");

-- CreateIndex
CREATE INDEX "quote_projects_orgId_salesApproverUserId_idx" ON "quote_projects"("orgId", "salesApproverUserId");

-- CreateIndex
CREATE UNIQUE INDEX "quote_requirements_projectId_key" ON "quote_requirements"("projectId");

-- CreateIndex
CREATE INDEX "estimate_items_projectId_idx" ON "estimate_items"("projectId");

-- CreateIndex
CREATE INDEX "estimate_items_projectId_category_idx" ON "estimate_items"("projectId", "category");

-- CreateIndex
CREATE INDEX "estimate_items_projectId_role_idx" ON "estimate_items"("projectId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "estimate_items_projectId_category_role_key" ON "estimate_items"("projectId", "category", "role");

-- CreateIndex
CREATE INDEX "proposal_sections_projectId_orderIndex_idx" ON "proposal_sections"("projectId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_sections_projectId_sectionKey_key" ON "proposal_sections"("projectId", "sectionKey");

-- CreateIndex
CREATE INDEX "proposal_blocks_projectId_sectionId_orderIndex_idx" ON "proposal_blocks"("projectId", "sectionId", "orderIndex");

-- CreateIndex
CREATE INDEX "proposal_blocks_projectId_archived_idx" ON "proposal_blocks"("projectId", "archived");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_blocks_projectId_blockKey_key" ON "proposal_blocks"("projectId", "blockKey");

-- CreateIndex
CREATE INDEX "review_comments_projectId_status_idx" ON "review_comments"("projectId", "status");

-- CreateIndex
CREATE INDEX "review_comments_blockId_status_idx" ON "review_comments"("blockId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "share_links_token_key" ON "share_links"("token");

-- CreateIndex
CREATE INDEX "share_links_projectId_idx" ON "share_links"("projectId");

-- CreateIndex
CREATE INDEX "share_links_expiresAt_idx" ON "share_links"("expiresAt");

-- CreateIndex
CREATE INDEX "pdf_exports_projectId_generatedAt_idx" ON "pdf_exports"("projectId", "generatedAt" DESC);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_cards" ADD CONSTRAINT "rate_cards_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_projects" ADD CONSTRAINT "quote_projects_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_projects" ADD CONSTRAINT "quote_projects_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_projects" ADD CONSTRAINT "quote_projects_pmApproverUserId_fkey" FOREIGN KEY ("pmApproverUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_projects" ADD CONSTRAINT "quote_projects_salesApproverUserId_fkey" FOREIGN KEY ("salesApproverUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_requirements" ADD CONSTRAINT "quote_requirements_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "quote_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate_items" ADD CONSTRAINT "estimate_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "quote_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_sections" ADD CONSTRAINT "proposal_sections_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "quote_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_blocks" ADD CONSTRAINT "proposal_blocks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "quote_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_blocks" ADD CONSTRAINT "proposal_blocks_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "proposal_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "quote_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "proposal_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "quote_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdf_exports" ADD CONSTRAINT "pdf_exports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "quote_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdf_exports" ADD CONSTRAINT "pdf_exports_generatedByUserId_fkey" FOREIGN KEY ("generatedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
