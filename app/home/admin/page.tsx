import { adminGuard } from '@/modules/auth'
import { redirect } from 'next/navigation'
import React from 'react'

const page = () => {
    if (!adminGuard()){
        redirect('/home')
    }

    return (
        <div>page</div>
    )
}

export default page