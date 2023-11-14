import emailjs from '@emailjs/browser';


export const sendEmails = false;


export default function SendEmail( to_email: string, subject: string, body: string) {
    if (!sendEmails) {
        console.log("Emailing is Disabled! Enable it in Email.ts @ line: 3 \"const sendEmails = false;\"");
        return;
    }

    const emailObj = {
        to_email: to_email,
        subject: subject,
        body: body,
    }

    emailjs.send('service_80f8gkw', 'template_sdi19nb', emailObj, 'i-1jRU-M89bNtxz60')
        .then((result) => { console.log("Email Result: " + result.text); },
            (error) => { console.log(error.text); });
}

export function SendEmailWithLink(to_email: string, subject: string, body: string, link: string) {
    if (!sendEmails) {
        console.log("Emailing is Disabled! Enable it in Email.ts @ line: 3 \"const sendEmails = false;\"");
        return;
    }

    const emailObj = {
        to_email: to_email,
        subject: subject,
        body: body,
        link: link
    }

    emailjs.send('service_80f8gkw', 'template_bat376f', emailObj, 'i-1jRU-M89bNtxz60')
        .then((result) => { console.log("Email Result: " + result.text); },
            (error) => { console.log(error.text); });
}