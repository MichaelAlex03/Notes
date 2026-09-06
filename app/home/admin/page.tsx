import { adminGuard } from '@/app/lib/adminGuard'
import { notFound } from 'next/navigation'
import React from 'react'

const page = () => {
    if (!adminGuard()){
        return notFound()
    }


    return (
        <div>page</div>
    )
}

export default page