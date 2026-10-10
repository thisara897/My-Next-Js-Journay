import { profile } from "console"
import z from "zod"

const UserSelfUpdateRequestSchema = z.object(
    {
        id : z.never().optional(),
        email : z.email().optional(),
        firstName : z.string().max(20).optional(),
        lastName : z.string().max(20).optional(),
        password : z.never().optional(),
        phone : z.string().optional(),
        profileImage : z.string().optional(),
        role : z.string().optional(),
        status : z.string().optional(),
        privileges : z.string().optional()

    }
)

export type UserSelfUpdateRequest = z.infer<typeof UserSelfUpdateRequestSchema>

export {UserSelfUpdateRequestSchema}