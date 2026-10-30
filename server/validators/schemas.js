// ========================================================================
// Request Validation Schemas (Zod)
// ========================================================================

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters')
}).refine(data => Boolean(data.email || data.username), {
  message: 'Valid newsroom username or email address is required',
  path: ['email']
});

const urlOrPathSchema = z.string().max(500).refine(
  (val) => {
    if (!val || val.trim() === '') return true;
    if (val.startsWith('/') || val.startsWith('./') || val.startsWith('data:image/')) return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Must be a valid web URL or local upload path (e.g. /uploads/...)' }
);

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

export const createUserSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(150),
  username: z.string().min(2, 'Username must be at least 2 characters').max(60).optional(),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['super_admin', 'editor', 'reporter', 'ad_manager']).default('reporter'),
  designation: z.string().max(120).optional(),
  bio: z.string().optional()
});

const baseArticleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  slug: z.string().max(255).optional(),
  kicker: z.string().max(100).optional(),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters'),
  articleBody: z.string().min(20, 'Article body must be at least 20 characters'),
  featuredImage: urlOrPathSchema.optional().nullable(),
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
  status: z.enum(['draft', 'in_review', 'scheduled', 'published', 'expired', 'archived']).optional(),
  priority: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
  isBreaking: z.boolean().optional(),
  isSponsored: z.boolean().optional(),
  sponsorClient: z.string().max(150).optional().nullable(),
  sponsorPlacementCode: z.string().max(80).optional().nullable(),
  language: z.enum(['en', 'mr', 'hi']).optional(),
  scheduledPublicationTime: z.string().optional().nullable(),
  tags: z.array(z.union([z.string(), z.number()])).optional(),
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().max(320).optional().nullable(),
  metaKeywords: z.string().max(255).optional().nullable(),
  canonicalUrl: urlOrPathSchema.optional().nullable(),
  ogImage: urlOrPathSchema.optional().nullable()
});

export const createArticleSchema = baseArticleSchema.extend({
  status: z.enum(['draft', 'in_review', 'scheduled', 'published', 'expired', 'archived']).default('draft'),
  priority: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
  isBreaking: z.boolean().default(false),
  isSponsored: z.boolean().default(false),
  language: z.enum(['en', 'mr', 'hi']).default('en')
});

export const updateArticleSchema = baseArticleSchema.partial().extend({
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

const campaignBaseSchema = z.object({
  placementId: z.number().int().positive('Valid placement ID is required'),
  title: z.string().min(3, 'Campaign title must be at least 3 characters').max(180),
  clientName: z.string().min(2, 'Client / Sponsor name is required').max(150),
  adType: z.enum(['image', 'code', 'text']).default('image'),
  bannerImageUrl: urlOrPathSchema.optional().nullable(),
  adCode: z.string().max(5000, 'Ad code exceeds maximum allowed size').optional().nullable(),
  targetUrl: z.string().max(500).optional().nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Start date must start with YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'End date must start with YYYY-MM-DD'),
  priority: z.number().int().min(0).max(100).default(5),
  isActive: z.boolean().default(true)
});

export const createCampaignSchema = campaignBaseSchema.refine(
  data => {
    if (data.adType === 'image') {
      return !!data.bannerImageUrl;
    }
    if (data.adType === 'code') {
      return !!data.adCode && data.adCode.trim().length > 0;
    }
    return true;
  },
  { message: 'Banner Image Creative URL is required for image campaigns; Ad code is required for code ads' }
);

export const updateCampaignSchema = campaignBaseSchema.partial();

export const createEnquirySchema = z.object({
  companyName: z.string().max(191).optional().default('Public Inbound Desk'),
  contactName: z.string().max(150).optional().default('Anonymous Contributor'),
  email: z.string().email('Valid email address is required').max(191),
  phone: z.string().max(50).optional().nullable(),
  website: z.string().max(255).optional().nullable(),
  budgetRange: z.string().max(100).optional().default('General Inquiry / Direct Tip'),
  preferredPlacements: z.array(z.string()).optional().default([]),
  flightStartDate: z.string().optional().nullable(),
  campaignObjectives: z.string().max(1000).optional().nullable(),
  message: z.string().min(5, 'Please provide details about your message or inquiry (min 5 characters)').max(4000)
});

export const updateEnquiryStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'proposal_sent', 'closed_won', 'closed_lost']),
  internalNotes: z.string().max(2000).optional().nullable()
});

export const createYoutubeVideoSchema = z.object({
  youtubeUrlOrId: z.string().min(3, 'YouTube URL or 11-character Video ID is required'),
  title: z.string().min(3, 'Video headline is required').max(255),
  description: z.string().max(2000).optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  relatedArticleId: z.number().int().positive().optional().nullable(),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().default(0)
});

export const updateYoutubeVideoSchema = createYoutubeVideoSchema.partial();

export const trackPageViewSchema = z.object({
  pagePath: z.string().min(1).max(255),
  pageType: z.string().max(50).default('article'),
  articleId: z.number().int().positive().optional().nullable(),
  referrer: z.string().max(255).optional().nullable(),
  deviceType: z.enum(['desktop', 'mobile', 'tablet']).default('desktop'),
  sessionId: z.string().max(64).optional().nullable()
});

export const updateSettingSchema = z.object({
  value: z.union([z.string(), z.number(), z.boolean()])
});

export const batchUpdateSettingsSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]));

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
  updateCampaignSchema,
  createEnquirySchema,
  updateEnquiryStatusSchema,
  createYoutubeVideoSchema,
  updateYoutubeVideoSchema,
  trackPageViewSchema,
  updateSettingSchema,
  batchUpdateSettingsSchema
};
