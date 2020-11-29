const transporterConfig = {
    service: 'gmail',
    host: process.env.HOST_SMTP,
    port:process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.TRANSPORTER_EMAIL,
        pass: process.env.EMAIL_PASS
    }
}

module.exports = transporterConfig;