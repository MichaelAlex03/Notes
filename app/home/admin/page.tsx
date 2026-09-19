import { adminGuard } from '@/app/lib/adminGuard'
import { notFound } from 'next/navigation'
import React from 'react'
import FeatureFlagHome from './components/feature-flag-home'

const page = () => {
    if (!adminGuard()){
        return notFound()
    }


    return (
        <FeatureFlagHome />
    )
}

export default page