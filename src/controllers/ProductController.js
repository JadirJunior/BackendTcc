const db = require("../database");
const azureController = require('./azureController');
const dataType = require('../utils/dataType');
const data = require("../config/azureConfig");

function upload(file) {
  azureController.upload(file);
  return `https://paperplan.blob.core.windows.net/images/${file.filename}`;
}

/**
 * 
 * @param {Array} products 
 */
function reduce(products) {
  var toReturn = [];
  products.forEach(product => {
    console.log(product)
    const productIndex = toReturn.findIndex(p => p.ID_PRODUTO === product.ID_PRODUTO)
    if (productIndex > -1) {
      console.log(productIndex)
      toReturn[productIndex].IMAGEM.push(product.IMAGEM);
    } else {
      product.IMAGEM = [product.IMAGEM];
      toReturn.push(product);
    }
  });
  return toReturn;
}

module.exports = {

  getProducts: async (req, res) => {
    const page = req.query.page == undefined ? 1 : req.query.page;
    const idUsuario = req.query.usuario;
    try {
      var products = [];

      await db('ACESSOS').insert({
        DIA_MES: dataType.getDayMonth(),
        ANO: dataType.getYear(),
        MES: dataType.getMonth()
      });

      if (idUsuario) {
        products = await db('produto').select(
              'PRODUTO.*',  
              'IMAGENS_PRODUTOS.IMAGEM',
              'USUARIO.USU_VEND_FIS',
              'USUARIO.IMAGEM AS IMAGEM_USUARIO',
              'USUARIO.NOME AS NOME_USUARIO',
              'USUARIO.EMAIL',
              'USUARIO.TELEFONE')
              .join('USUARIO', 'PRODUTO.ID_USUARIO', '=','USUARIO.ID_USUARIO')
              .join('IMAGENS_PRODUTOS', 'IMAGENS_PRODUTOS.ID_PRODUTO', '=', 'PRODUTO.ID_PRODUTO')
              .limit(10)
              .offset((page-1)*20)
              .where('PRODUTO.ID_USUARIO', idUsuario);

        return res.json(reduce(products));
      }
        
       products = await db('produto').select(
         'PRODUTO.*',  
         'IMAGENS_PRODUTOS.IMAGEM',
         'USUARIO.USU_VEND_FIS',
         'USUARIO.IMAGEM AS IMAGEM_USUARIO',
         'USUARIO.NOME AS NOME_USUARIO',
         'USUARIO.EMAIL',
         'USUARIO.TELEFONE')
       .join('USUARIO', 'PRODUTO.ID_USUARIO', '=','USUARIO.ID_USUARIO')
       .join('IMAGENS_PRODUTOS', 'IMAGENS_PRODUTOS.ID_PRODUTO', '=', 'PRODUTO.ID_PRODUTO')
       .limit(10)
       .offset((page-1)*20); 

      return res.json(reduce(products));
    } catch (error) {
      console.log(error);
      return res.json({
        error: "Ocorreu um erro inesperado, tente novamente!",
      });
    }
  },

  addProduct: async (req, res) => {
    const idUsuario = req.headers.authorization;
    if (req.files.length === 0) return res.json({error: 'Você precisa de pelo menos uma imagem do produto!'});
    if (!idUsuario) return res.json({ error: "Vendedor não informado!" });
    var files = [];
    files = req.files;

    const { 
      Nome, 
      Quantidade, 
      Preco, 
      Categoria, 
      HEX, 
      Tamanho 
    } = req.body;

    try {
      const vendedor = await db("USUARIO")
        .select("*")
        .where("ID_USUARIO", idUsuario);

      if (vendedor.length == 0)
        return res.json({ error: "Vendedor não existe!" });
        var date = Date.now();
        await db("PRODUTO").insert({
          ID_USUARIO: idUsuario,
          NOME: Nome,
          QUANTIDADE: Number(Quantidade),
          PRECO: Preco,
          CATEGORIA: Categoria,
          ANO: dataType.getYear(), 
          DIASEMANA: dataType.getDayOfWeek(), 
          DIAMES: dataType.getDayMonth(), 
          MES: dataType.getMonth(), 
          HEX, 
          TAMANHO: Tamanho,
          DATA: date.toString()
        });
        
        const {ID_PRODUTO: idProduto} = await db('PRODUTO').select('*')
        .where('DATA', date.toString()).first();

      files.forEach(async (file) => {
        var img = upload(file);
        await db('IMAGENS_PRODUTOS').insert({
          ID_PRODUTO: idProduto,
          IMAGEM: img
        })
      });

      return res.json({ message: "Produto cadastrado com sucesso!" });
    } catch (error) {
      return res.json({
        error: "Ocorreu um erro inesperado, tente novamente!",
      });
    }
  },

  deleteProduct: async (req, res) => {
    const { id } = req.params;
    const idUsuario = req.headers.authorization;

    if (!idUsuario)
      return res.json({ error: "Logue antes de deletar um produto!" });

    if (!id) return res.json({ error: "Produto não informado!" });

    try {
      const products = await db("PRODUTO")
        .select("*")
        .where("ID_USUARIO", idUsuario)
        .andWhere("ID_PRODUTO", id);
      
      if (products.length == 0)
        return res.json({ error: "Produto não existe!" });

      await db('IMAGENS_PRODUTOS').delete().where('ID_PRODUTO', id);
      await db('PRODUTOS_VENDIDOS').delete().where('ID_PRODUTO', id);
      
      await db("PRODUTO")
        .delete()
        .where("ID_PRODUTO", id)
        .andWhere("ID_USUARIO", idUsuario);

      return res.json({ message: "Produto deletado com sucesso!" });
    } catch (error) {
      return res.json({ erro: "Ocorreu um erro inesperado, tente novamente!" });
    }
  },

  searchProductByName: async (req, res) => {
    const { q } = req.query;
    const page = req.query.page == undefined ? req.query.page : 1;

    const products = await db('produto').select(
        'PRODUTO.*',  
        'IMAGENS_PRODUTOS.IMAGEM',
        'USUARIO.USU_VEND_FIS',
        'USUARIO.IMAGEM AS IMAGEM_USUARIO',
        'USUARIO.NOME AS NOME_USUARIO',
        'USUARIO.EMAIL',
        'USUARIO.TELEFONE')
      .join('USUARIO', 'PRODUTO.ID_USUARIO', '=','USUARIO.ID_USUARIO')
      .join('IMAGENS_PRODUTOS', 'IMAGENS_PRODUTOS.ID_PRODUTO', '=', 'PRODUTO.ID_PRODUTO')
      .limit(10)
      .offset((page-1)*20)
      .where("PRODUTO.NOME", "like", `%${q.split("+").join(" ")}%`);
    
      return res.json(products);
  },

  getProductById: async (req, res) => {
    const id = req.params.id;
    try {
      if (!id) return res.json({error: 'Id Não informado!'});
      var product = [];
       product = await db('PRODUTO').select(
        'PRODUTO.*',  
        'IMAGENS_PRODUTOS.IMAGEM',
        'USUARIO.USU_VEND_FIS',
        'USUARIO.IMAGEM AS IMAGEM_USUARIO',
        'USUARIO.NOME AS NOME_USUARIO',
        'USUARIO.EMAIL',
        'USUARIO.TELEFONE')
        .join('USUARIO', 'PRODUTO.ID_USUARIO', '=','USUARIO.ID_USUARIO')
        .join('IMAGENS_PRODUTOS', 'IMAGENS_PRODUTOS.ID_PRODUTO', '=', 'PRODUTO.ID_PRODUTO')
        .where("PRODUTO.ID_PRODUTO", id).first();
      return res.json(product === undefined ? {message: 'Produto não existe'} : product);
      
    } catch (error) {
      return res.json({error: 'Ocorreu um erro inesperado. Tente novamente!'})
    }
  },
  
  editProduct: async (req,res) => {
    const idUser = req.headers.authorization;
    const { id } = req.params;
    if (!idUser) return res.json({error: 'Logue para editar o produto!'});
    const { 
      Nome, 
      Quantidade, 
      Preco, 
      Categoria,
      HEX, 
      Tamanho } = req.body;
      
      if (req.files.length === 0) return res.json({error: 'Utilize pelo menos uma imagem!'});
      var files = [];
      files = req.files;
    try {
      await db('PRODUTO').update({
        ID_USUARIO: idUser,
        NOME: Nome,
        QUANTIDADE: Quantidade,
        PRECO: Preco,
        CATEGORIA: Categoria,
        ANO: dataType.getYear(),
        DIASEMANA: dataType.getDayOfWeek(),
        DIAMES: dataType.getDayMonth(),
        MES: dataType.getMonth(),
        HEX: HEX,
        TAMANHO: Tamanho,
        DATA: Date.now().toString()
      }).where('ID_PRODUTO', id).andWhere('ID_USUARIO', idUser);

      await db('IMAGENS_PRODUTOS').delete().where('ID_PRODUTO', id);
      files.forEach(async (file) => {
        await db('IMAGENS_PRODUTOS').insert({
          ID_PRODUTO: id,
          IMAGEM: upload(file)
        });

      })
      return res.json({message: 'Produto atualizado com sucesso!'})
    } catch (error) {
      console.log(error);
      return res.json({error: 'Ocorreu um erro inesperado, tente novamente!'})
    }
  },

  sellProduct: async (req, res) => {
    const {quantidadeVendida} = req.body;
    const idUser = req.headers.authorization;
    const { id } = req.params;
    if (!idUser) return res.json({error: 'Logue para editar o produto!'})

    try {
      const {QUANTIDADE: qtde} = await db('PRODUTO').select('*').where('ID_PRODUTO', id).andWhere('ID_USUARIO', idUser).first();
      await db('PRODUTO').update({
        QUANTIDADE: qtde-quantidadeVendida < 0 ? 0 : qtde-quantidadeVendida
      }).where('ID_USUARIO', idUser).andWhere('ID_PRODUTO', id);
      await db('PRODUTOS_VENDIDOS').insert({
        ID_PRODUTO: id,
        DIADASEMANA: dataType.getDayOfWeek(),
        DIAMES: dataType.getDayMonth(),
        ANO: dataType.getYear(),
        QUANTIDADE: quantidadeVendida,
        MES: dataType.getMonth(),
      })
      return res.json({message: 'Produto Vendido!'});
    } catch (error) {
      return res.json({error: 'Ocorreu um erro, tente novamente.'})
    }
  }
};
