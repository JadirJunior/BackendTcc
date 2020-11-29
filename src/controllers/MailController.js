const nodemailer = require('nodemailer');
const configMailer = require('../config/Mailer');
const db = require('../database');

module.exports = {
    sendMail: async (req, res) => {
        
        const idUser = req.headers.authorization;
        const {subject, text} = req.body;

        const email = await 
        db('USUARIO')
        .select('email')
        .where('ID_USUARIO', idUser)
        .first()
        ;

        if (!email) return res.json({error: 'Usuário não encontrado'});


        const transporter = nodemailer.createTransport(configMailer);

        transporter.sendMail({
            from: process.env.TRANSPORTER_EMAIL,
            to: process.env.TRANSPORTER_EMAIL,
            subject: subject,
            text: text
        }).then(() => {
            return res.json({message: 'Email enviado com sucesso!' })
        }).catch((err) => {
            return res.json(console.log(err))
        })
        ;
    }
}



