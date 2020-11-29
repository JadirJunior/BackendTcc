const db = require("../database");
const path = require('path');
const azureController = require('./azureController');

function upload(file) {
  azureController.upload(file);
  return `https://paperplan.blob.core.windows.net/images/${file.filename}`;
}

module.exports = {
  /**
   * @param {Request} req requisição http
   * @param {Response} res Resposta
   */
  createSeller: async (req, res) => {
    const {
      Cpf,
      usuario,
      Senha,
      Nome,
      Sexo,
      Endereco,
      Telefone,
      Email,
      Ano,
      Dia_Semana,
      Dia_Mes,
      Mes
    } = req.body;

    const Sellers = await db("USUARIO")
      .select("*")
      .where("CPF", Cpf)
      .orWhere("EMAIL", Email);

    if (Sellers.length != 0)
      return res.json({ error: "Cpf ou Email já encontra-se cadastrado!" });

    try {

      if (req.file)
        azureController.upload(req.file);

      const trx = await db.transaction();
      await trx("USUARIO").insert({
        CPF: Cpf,
        USU_VEND_FIS: usuario,
        NOME: Nome,
        SENHA: Senha,
        SEXO: Sexo,
        ENDERECO: Endereco,
        TELEFONE: Telefone,
        EMAIL: Email,
        IMAGEM: req.file ? `https://paperplan.blob.core.windows.net/images/${req.file.filename}` : '',
        ANO: Ano, 
        DIASEMANA: Dia_Semana, 
        DIAMES: Dia_Mes, 
        MES: Mes,
      });

      const user = await trx('USUARIO').select('*').where('CPF', Cpf).first();
      await trx('AVALIACAO').insert({
        ID_USUARIO: user.ID_USUARIO,
        AVAL_ESTRELAS: 0,
        AVAL_COMENT: 'N/A'
      });
      trx.commit();

      
      return res.json({ message: "Vendedor Cadastrado com Sucesso!" });
    } catch (error) {
      console.log(error);
      return res.json({ erro: error });
    }
  },

  deleteSeller: async (req, res) => {
    const { id } = req.params;

    if (!id) return res.json({ message: "Vendedor não informado!" });

    try {
      const trx = await db.transaction();
      await trx("AVALIACAO").delete().where("ID_USUARIO", id);
      await trx("PRODUTO").delete().where("ID_USUARIO", id);
      await trx("USUARIO").delete().where("ID_USUARIO", id);
      trx.commit();

      return res.json({ message: "Vendedor excluído com sucesso!" });
    } catch (error) {
      return res.json({
        error: "Ocorreu um erro Inesperado, tente novamente!",
      });
    }
  },

  listSellers: async (req, res) => {
    const page = req.query.page ? req.query.page : 1;
    const sellers = await db("USUARIO")
      .join('AVALIACAO','USUARIO.ID_USUARIO', '=', 'AVALIACAO.ID_USUARIO')
      .select("USUARIO.*")
      .avg('AVALIACAO.AVAL_ESTRELAS as ESTRELAS')
      .orderBy("USUARIO.ID_USUARIO")
      .offset((page - 1) * 20)
      .groupBy(
        'USUARIO.ID_USUARIO', 
        'USUARIO.CPF',
        'USUARIO.USU_VEND_FIS',
        'USUARIO.IMAGEM',
        'USUARIO.SENHA',
        'USUARIO.NOME',
        'USUARIO.SEXO',
        'USUARIO.ENDERECO',
        'USUARIO.TELEFONE',
        'USUARIO.EMAIL',
        'USUARIO.ANO',
        'USUARIO.DIASEMANA',
        'USUARIO.DIAMES',
        'USUARIO.MES')
      .limit(5);

    return res.json(sellers);
  },

  updateSeller: async (req, res) => {
    const Id = req.headers.authorization;

    const { usuario, Nome, Sexo, Endereco, Telefone, Email, Senha } = req.body;
    const user = await db("USUARIO")
      .select("*")
      .where("ID_USUARIO", Id)
      .first();

    const users = await db('USUARIO').select('*').where('ID_USUARIO', '!=', Id);
  
    if (!user) return res.json({ error: "Usuário não encontrado!" });

    /*if (user.EMAIL === Email && user.ID_USUARIO !== Id)
      return res.json({ error: "Email já encontra-se cadastrado!" });*/

    console.log(users);

    if (users.includes(Email)) 
      return res.json({error: 'Email já encontra-se cadastrado!'});

    var img = req.file ? upload(req.file) : '';
    await db("USUARIO").update({
      CPF: user.CPF,
      USU_VEND_FIS: usuario,
      SENHA: Senha,
      NOME: Nome,
      SEXO: Sexo,
      IMAGEM: img,
      ENDERECO: Endereco,
      TELEFONE: Telefone,
      EMAIL: Email,
    }).where('ID_USUARIO', Id);

    return res.json({ message: "Vendedor Atualizado com sucesso!" });
  },

  getSpecificSeller: async (req, res) => {
    const id = req.params.id;

    const user = await db("USUARIO")
      .select("*")
      .where("ID_USUARIO", id)
      .first();

    if (!user) return res.json({ erro: "Usuário não encontrado" });

    return res.json(user);
  },

  startSession: async (req, res) => {
    const { Cpf, Senha } = req.body;

    const user = await db("USUARIO")
      .select("*")
      .where("CPF", Cpf)
      .andWhere("SENHA", Senha)
      .first();

    if (!user) return res.json({ error: "Usuário ou senha incorretos!" });

    return res.json(user);
  },

  addAvaliacao: async (req, res) => {
    const idUsuario = req.headers.authorization;
    const { stars, Comentario } = req.body;

    if (!idUsuario) return res.json({ error: "Vendedor não informado!" });

    try {
      await db("AVALIACAO").insert({
        ID_USUARIO: idUsuario,
        AVAL_ESTRELAS: stars,
        AVAL_COMENT: Comentario,
      });

      return res.json({ message: "Muito Obrigado pela avaliação!" });
    } catch (error) {
      return res.json({ error: 'Vendedor inexistente!' });
    }
  },
};
