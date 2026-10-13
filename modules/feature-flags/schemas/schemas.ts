import { z } from "zod/v4"

export interface FeatureFlagResults {
    id: string;
    name: string;
    global_enabled: boolean;
}

export type User = {
    id: string;
    first_name: string;
    last_name: string;
    enabled: boolean
}

export interface UserResults {
    users: User[];
    moreData: boolean;
}

export interface FetchUserProps {
    page: number;
    flagId: string;
    searchQuery: string
}

export const AddFeatureFlagSchema = z.object({
    flagName: z.string()
})

export interface AddFeatureFlagResults {
    success: boolean;
    flagId: string
    error: string
}
