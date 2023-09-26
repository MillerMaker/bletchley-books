import emailjs from '@emailjs/browser';


const sendEmails = false;


export default function SendEmail( to_email: string, subject: string, body: string) {
    if (!sendEmails) {
        console.log("Emailing is Disabled! Enable it in Email.ts @ line: 3 \"const sendEmails = false;\"");
        return;
    }


    emailjs.send('service_80f8gkw', 'template_sdi19nb', emailObj, 'i-1jRU-M89bNtxz60')
        .then((result) => { console.log("Email Result: " + result.text); },
            (error) => { console.log(error.text); });
}