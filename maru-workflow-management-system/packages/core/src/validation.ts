import { z } from 'zod'

export const CreateJobSchema = z.object({
  orgId: z.string(),
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  seniority: z.string().optional()
})

export type CreateJob = z.infer<typeof CreateJobSchema>
