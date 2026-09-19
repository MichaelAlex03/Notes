import { adminGuard } from '@/modules/auth'
import { notFound } from 'next/navigation'
import { FeatureFlagHome } from '@/modules/feature-flags'

const page = () => {
    if (!adminGuard()){
        return notFound()
    }

    return (
        <FeatureFlagHome />
    )
}

export default page