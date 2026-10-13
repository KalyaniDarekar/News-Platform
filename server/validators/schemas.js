// ========================================================================
// Request Validation Schemas (Zod)
// ========================================================================

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Valid newsroom email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

export const createUserSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(150),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['super_admin', 'editor', 'reporter', 'ad_manager']).default('reporter'),
  designation: z.string().max(120).optional(),
  bio: z.string().optional()
});

export const createArticleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  slug: z.string().max(255).optional(),
  kicker: z.string().max(100).optional(),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters'),
  articleBody: z.string().min(20, 'Article body must be at least 20 characters'),
  featuredImage: z.string().url('Featured image must be a valid URL').optional().nullable(),
  imageCaption: z.string().max(255).optional().nullable(),
  altText: z.string().max(255).optional().nullable(),
  youtubeUrl: z
    .string()
    .max(500)
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true; // empty is fine
        try {
          const u = new URL(val);
          return u.hostname.includes('youtube.com') || u.hostname === 'youtu.be';
        } catch {
          return false;
        }
      },
      { message: 'youtubeUrl must be a valid YouTube link (youtube.com or youtu.be)' }
    ),
  expiryTime: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true; // clearing expiry is allowed
        const d = new Date(val);
        return !isNaN(d.getTime()); // must be parseable as a date
      },
      { message: 'expiryTime must be a valid ISO 8601 date/time string' }
    ),
  categoryId: z.number().int().positive('Category ID must be a positive integer'),
  status: z.enum(['draft', 'in_review', 'scheduled', 'published', 'expired', 'archived']).default('draft'),
  priority: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
  isBreaking: z.boolean().default(false),
  isSponsored: z.boolean().default(false),
  sponsorClient: z.string().max(150).optional().nullable(),
  language: z.enum(['en', 'mr', 'hi']).default('en'),
  scheduledPublicationTime: z.string().optional().nullable(),
  tags: z.array(z.union([z.string(), z.number()])).optional(),
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().max(320).optional().nullable(),
  metaKeywords: z.string().max(255).optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable(),
  ogImage: z.string().url().optional().nullable()
});

export const updateArticleSchema = createArticleSchema.partial().extend({
  revisionNotes: z.string().max(255).optional()
});

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  slug: z.string().max(140).optional(),
  description: z.string().optional(),
  parentId: z.number().int().positive().optional().nullable(),
  displayOrder: z.number().int().default(0),
  colorBadge: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color code').default('#0A2540')
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional()
});

export const createTagSchema = z.object({
  name: z.string().min(2, 'Tag name must be at least 2 characters').max(100)
});

export const createCampaignSchema = z.object({
  placementId: z.number().int().positive('Valid placement ID is required'),
  title: z.string().min(3).max(180),
  clientName: z.string().min(2).max(150),
  bannerImageUrl: z.string().url('Banner image must be a valid URL'),
  targetUrl: z.string().url('Target URL must be a valid URL'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
  isActive: z.boolean().default(true)
});

export const updateSettingSchema = z.object({
  value: z.union([z.string(), z.number(), z.boolean()])
});

export default {
  loginSchema,
  changePasswordSchema,
  createUserSchema,
  createArticleSchema,
  updateArticleSchema,
  createCategorySchema,
  updateCategorySchema,
  createTagSchema,
  createCampaignSchema,
  updateSettingSchema
};
