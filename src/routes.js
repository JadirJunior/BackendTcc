const express = require('express');
const ProductController = require('./controllers/ProductController');
const SellerController = require('./controllers/SellerController');
const mailController = require('./controllers/MailController');
const multerConfig = require('./config/multerConfig');
const multer = require('multer')
const upload = multer(multerConfig);


const routes = express.Router();

/**
 * FUNCIONALIDADES
 * -> LISTAR PRODUTOS - FEITO
 * -> LISTAR PRODUTOS POR VENDEDOR - FEITO
 * -> PESQUISAR PRODUTOS POR NOME - FEITO
 * -> CADASTRAR UM PRODUTO - FEITO
 * -> DELETAR UM PRODUTO - FEITO
 * -> CRIAÇÃO DE USUÁRIOS - FEITO
 * -> CRIAÇÃO DE VENDEDORES - FEITO
 * -> AUTENTICAÇÃO/LOGIN NO SITE - FEITO
 * -> FORMAS DE PAGAMENTO (TALVEZ)
 * -> Sistema de Avaliação de Vendedores - FEITO
 * -> PEGAR DADOS DE VENDEDOR ESPEFÍCICO - FEITO
 * -> ALTERAR DADOS DO VENDEDOR/USUÁRIO(CLIENTE) - FEITO
 * -> LISTAR VENDEDORES COM PAGINAÇÃO - FEITO
 * -> FALE CONOSCO COM POSSIBILIDADE DE ENVIO DE EMAIL PARA O EMAIL DA PAPERPLAN - FEITO
*/

//#region Produtos
routes.get('/products', ProductController.getProducts);
routes.post('/products', upload.array('file', 4),ProductController.addProduct);
routes.get('/products/search', ProductController.searchProductByName);
routes.delete('/products/:id',  ProductController.deleteProduct);
routes.get('/products/:id',  ProductController.getProductById);
routes.put('/products/:id',  upload.array('file', 4),ProductController.editProduct);
routes.put('/products/venda/:id', ProductController.sellProduct);
//#endregion

//#region Usuários   
routes.post('/cadastro/usuario', upload.single('file'),SellerController.createSeller);
routes.post('/login', SellerController.startSession);
routes.delete('/usuario/:id', SellerController.deleteSeller);
routes.get('/usuarios', SellerController.listSellers);
routes.put('/usuario/edit', upload.single('file'), SellerController.updateSeller);
routes.get('/usuarios/:id', SellerController.getSpecificSeller);
routes.post('/usuarios',  SellerController.addAvaliacao);
//#endregion

//#region 
routes.post('/faleconosco', mailController.sendMail);
//#endregion

module.exports = routes;