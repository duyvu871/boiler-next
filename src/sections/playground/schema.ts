import { z } from 'zod'

export const PlaygroundConfigSchema = z.object({
  version: z.string().optional(),
  timestamp: z.string().optional(),
  modelInfo: z.array(z.object({ name: z.string(), visible: z.boolean() })).optional(),
  // shapeKeys: record of name -> numeric value
  shapeKeys: z.record(z.string(), z.number()),
})

export type PlaygroundConfig = z.infer<typeof PlaygroundConfigSchema>


