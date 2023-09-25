import emailjs from '@emailjs/browser';

export default function SendEmail( emailObj: { to_email: string, subject: string, body: string }) {
    emailjs.send('service_80f8gkw', 'template_sdi19nb', emailObj, 'i-1jRU-M89bNtxz60')
        .then((result) => { console.log("Email Result: " + result.text); },
            (error) => { console.log(error.text); });
}