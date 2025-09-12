import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.string().optional(),
    updatedDate: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    slug: z.string(),
    draft: z.boolean().optional().default(false),
    canonical: z.string().url().optional()
  })
});

export const collections = { blog };
