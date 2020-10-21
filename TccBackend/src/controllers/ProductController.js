const db = require('../database');
module.exports = {
    
    getProducts: async (req, res) => {

        const page = req.query.page == undefined ? 1 : req.query.page;
        const idVendedor = req.query.vendedor;
        try {
            var products = [];

            if (idVendedor) {
                products = await db('PRODUTO')
                .join('VENDEDOR_FISICO', 'PRODUTO.ID_VENDEDOR','VENDEDOR_FISICO.ID_VENDEDOR')
                .select('PRODUTO.*', 
                'VENDEDOR_FISICO.NOME as NomeVendedor', 
                'VENDEDOR_FISICO.USU_VEND_FIS as UsuarioVendedor'
                , 'VENDEDOR_FISICO.TELEFONE'
                , 'VENDEDOR_FISICO.EMAIL')
                .orderBy('PRODUTO.ID_PRODUTO')
                .limit(10)
                .offset((page-1)*10)
                .where('PRODUTO.ID_VENDEDOR', idVendedor);

                return res.json(products);
            }

            products = await db('PRODUTO')
            .join('VENDEDOR_FISICO', 'PRODUTO.ID_VENDEDOR','VENDEDOR_FISICO.ID_VENDEDOR')
            .select('PRODUTO.*', 
            'VENDEDOR_FISICO.NOME as NomeVendedor', 
            'VENDEDOR_FISICO.USU_VEND_FIS as UsuarioVendedor'
            , 'VENDEDOR_FISICO.TELEFONE'
            , 'VENDEDOR_FISICO.EMAIL')
            .orderBy('ID_PRODUTO')
            .limit(10)
            .offset((page-1)*10)

            return res.json(products);

        } catch (error) {
            return res.json({error: 'Ocorreu um erro inesperado, tente novamente!'});
        }

    },

    addProduct: async (req,res) => {

        const idVendedor = req.headers.authorization;

        if (!idVendedor) return res.json({error: 'Vendedor não informado!'});

        const {
            Nome,
            Quantidade,
            Preco,
            Categoria,
        } = req.body;


        try {
            const vendedor = await db('VENDEDOR_FISICO').select('*').where('ID_VENDEDOR', idVendedor);

            if (vendedor.length == 0) return res.json({error: 'Vendedor não existe!'});

            await db('PRODUTO').insert({
                ID_VENDEDOR: idVendedor,
                AVALIACAO: 'Nenhuma',
                NOME: Nome,
                QUANTIDADE: Number(Quantidade),
                PRECO: Preco,
                CATEGORIA: Categoria
            });

            return res.json({ message: 'Produto cadastrado com sucesso!' })
        } 
        catch (error) {
            return res.json({error: 'Ocorreu um erro inesperado, tente novamente!'});  
        }
    },

    deleteProduct: async (req,res) => {

        const { id } = req.params;
        const idVendedor = req.headers.authorization;
        
        if (!idVendedor) return res.json({error: 'Logue antes de deletar um produto!'});

        if (!id) return res.json({error: 'Produto não informado!'});
        
        try {

            const products = await db('PRODUTO').select('*').where('ID_VENDEDOR', idVendedor).andWhere('ID_PRODUTO', id);
            if (products.length == 0) return res.json({error: 'Produto não existe!'});
            await db('PRODUTO').delete().where('ID_PRODUTO', id).andWhere('ID_VENDEDOR', idVendedor);
            return res.json({message: 'Produto deletado com sucesso!'});

        } catch (error) {
            return res.json({erro: 'Ocorreu um erro inesperado, tente novamente!'})
        }

    },

    searchProductByName: async ( req, res) => {
        const { q } = req.query;
        
        const products = await 
        db('PRODUTO')
        .join('VENDEDOR_FISICO', 'PRODUTO.ID_VENDEDOR','VENDEDOR_FISICO.ID_VENDEDOR')
        .select('PRODUTO.*', 
        'VENDEDOR_FISICO.NOME as NomeVendedor', 
        'VENDEDOR_FISICO.USU_VEND_FIS as UsuarioVendedor'
        , 'VENDEDOR_FISICO.TELEFONE'
        , 'VENDEDOR_FISICO.EMAIL')
        .where('PRODUTO.NOME', 'like', `%${q.split('+').join(' ')}%`);
        
        return res.json(products);
    }
}