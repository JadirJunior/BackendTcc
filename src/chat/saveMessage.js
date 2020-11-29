const db = require('../database');

module.exports = {
    saveMessage: async (Author, Content, Destinatario) => {
        try {
            await db('Mensagens').insert({
                Author,
                Content,
                Destinatario
            });
            return true;
        } 
        catch (error) {
            return false;   
        }
    }
}