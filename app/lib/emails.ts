import { resend } from "./client";


export const sendVerifyEmail = async (reciever: string) => {
    const { error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: [reciever],
        subject: 'Hello World',
        html: '<strong>It works!</strong>',
    });

    if (error) {
        throw new Error(error.message);
    }

};