import { supabaseAdmin } from "@/supabase/adminClient";

interface RateLimitInput {
    event: 'sign.in' | 'sign.up' | 'verify.sign.up',
    windowSize: number,
    threshold: number,
    identifier: string
}

interface RateLimitResponse {
    success: boolean,
    error?: string
}

interface CalculateRemaining {
    windowSize: number,
    windowStart: string,
}


const calculateRemainingTime = ({ windowSize, windowStart }: CalculateRemaining): number => {
    return Math.ceil(((new Date(windowStart).getTime() + windowSize) - Date.now()) / (1000 * 60))
}

export const checkRateLimits = async ({ event, windowSize, identifier, threshold }: RateLimitInput): Promise<RateLimitResponse> => {

    const { data: rateLimits, error: ipRateLimitError } = await supabaseAdmin
        .from('rate_limits')
        .select('id, attempts, window_start')
        .eq('identifier', identifier)
        .eq('event_type', event)
        .gt('window_start', new Date(Date.now() - windowSize).toISOString())
        .order('window_start', { ascending: false })
        .limit(1)

    if (ipRateLimitError) {
        return {
            success: false,
            error: 'Unable to fetch rate limit data'
        }
    }

    const attempts = rateLimits.length > 0 ? rateLimits[0].attempts : 0
    if (attempts > threshold) {
        const remainingTime = calculateRemainingTime({ windowSize, windowStart: rateLimits[0].window_start })
        return {
            success: false,
            error: `Too many attempts, please try again in ${remainingTime} minutes`
        }
    }

    if (attempts > 0) {
        const { error: rateLimitUpdateError } = await supabaseAdmin
            .from('rate_limits')
            .update({
                attempts: attempts + 1,
            })
            .eq('id', rateLimits[0].id)

        if (rateLimitUpdateError) {
            return {
                success: false,
                error: 'Unable to update rate limit'
            }
        }
    } else {
        const { error: rateLimitInsertError } = await supabaseAdmin.from('rate_limits')
            .insert({
                identifier: identifier,
                event_type: event,
                attempts: 1,
                window_start: new Date(Math.floor(Date.now() / windowSize) * windowSize).toISOString()
            })

        if (rateLimitInsertError) {
            return {
                success: false,
                error: 'Unable to insert new rate limit row'
            }
        }
    }

    return {
        success: true,
        error: ''

    }
}