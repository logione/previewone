import { z } from 'zod'

export const QueryBody = z.object({
    downloadUrl: z.string().url(),
    uploadUrl: z.string().url(),
    fileName: z.string().min(1),
})
export type QueryBody = z.infer<typeof QueryBody>