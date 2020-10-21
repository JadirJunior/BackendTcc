const db = require('../database');


module.exports = {
    createSeller: async (req, res) => {
        const {
            Cpf,
            usuario,
            Senha,
            Nome,
            Sexo,
            Endereco,
            Telefone,
            Email
        } = req.body;

        const Sellers = await db('VENDEDOR_FISICO').select('*').where('CPF', Cpf).orWhere('EMAIL', Email);

        if (Sellers.length != 0) return res.json({error: 'Cpf ou Email já encontra-se cadastrado!'});

        try {

            await db('VENDEDOR_FISICO').insert({
                CPF: Cpf,   
                USU_VEND_FIS: usuario,
                NOME: Nome,
                SENHA: Senha,
                SEXO: Sexo,
                ENDERECO: Endereco,
                TELEFONE: Telefone,
                EMAIL: Email
            });

            return res.json({message: 'Vendedor Cadastrado com Sucesso!'})
        } catch (error) {
            return res.json({erro: error})
        }
    },

    deleteSeller: async (req,res) => {
        const { id } = req.params;
        
        if (!id) return res.json({message: 'Vendedor não informado!'});

        try {
            
            const trx = await db.transaction();
            await trx('PRODUTO').delete().where('ID_VENDEDOR', id);
            await trx('VENDEDOR_FISICO').delete().where('ID_VENDEDOR', id);
            trx.commit();

            return res.json({message: 'Vendedor excluído com sucesso!'});
        } catch (error) {
            return res.json({ error: 'Ocorreu um erro Inesperado, tente novamente!' });
        }
        
    },

    listSellers: async (req,res) => {
        const page = req.query.page ?  req.query.page : 1;
        const sellers = await db('VENDEDOR_FISICO').select('*')
        .orderBy('ID_VENDEDOR')
        .offset((page-1)*5)
        .limit(5);

        return res.json(sellers);
    },

    updateSeller: async (req,res) => {
        const Id = req.headers.authorization;

        const {
            usuario,
            Nome,
            Sexo,
            Endereco,
            Telefone,
            Email,
            Senha
        } = req.body;

        const user = await db('VENDEDOR_FISICO').select('*').where('ID_VENDEDOR', Id).first();

        if (!user) return res.json({error: 'Usuário não encontrado!'});

        if (user.EMAIL === Email && user.ID_VENDEDOR !== Id) return res.json({error: 'Email já encontra-se cadastrado!'})

        await db('VENDEDOR_FISICO').update({
            CPF: user.CPF,
            USU_VEND_FIS: usuario,
            SENHA: Senha,
            NOME: Nome,
            SEXO: Sexo,
            ENDERECO: Endereco,
            TELEFONE: Telefone,
            EMAIL: Email
        });

        return res.json({message: 'Vendedor Atualizado com sucesso!'})
    },

    getSpecificSeller: async (req,res) => {
        const id = req.params.id;

        const user = await db('VENDEDOR_FISICO').select('*').where('ID_VENDEDOR', id).first();

        if (!user) return res.json({erro: 'Usuário não encontrado'});

        return res.json(user);
    },

    startSession: async (req,res) => {
        const {
            Cpf,
            Senha
        } = req.body;

        const user = await db('VENDEDOR_FISICO').select('*').where('CPF', Cpf).andWhere('SENHA', Senha).first();

        if (!user) return res.json({error: 'Usuário ou senha incorretos!'});

        return res.json(user);
    }
}