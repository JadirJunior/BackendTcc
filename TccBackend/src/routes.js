const express = require('express');
const ProductController = require('./controllers/ProductController');
const SellerController = require('./controllers/SellerController');
const mailController = require('./controllers/MailController');

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
 * -> MIDDLEWARES COM JWT PARA VALIDAÇÃO DE DADOS
 * -> FORMAS DE PAGAMENTO (TALVEZ)
 * -> CRIPTOGRAFIA DA SENHA (SALT E HASH)
 * -> PEGAR DADOS DE VENDEDOR ESPEFÍCICO - FEITO
 * -> ALTERAR DADOS DO VENDEDOR/USUÁRIO(CLIENTE) - FEITO
 * -> LISTAR VENDEDORES COM PAGINAÇÃO - FEITO
 * -> FALE CONOSCO COM POSSIBILIDADE DE ENVIO DE EMAIL PARA O EMAIL DA PAPERPLAN - FEITO
*/






//#region Produtos
routes.get('/products', ProductController.getProducts);
routes.post('/products', ProductController.addProduct);
routes.get('/products/search', ProductController.searchProductByName);
routes.delete('/products/:id',  ProductController.deleteProduct);
//#endregion

//#region Usuários   
routes.post('/cadastro/vendedor', SellerController.createSeller);
routes.post('/login', SellerController.startSession);
routes.delete('/vendedor/:id', SellerController.deleteSeller);
routes.get('/vendedores', SellerController.listSellers);
routes.put('/vendedor/edit', SellerController.updateSeller);
routes.get('/vendedores/:id', SellerController.getSpecificSeller);
//#endregion

//#region 
routes.post('/faleconosco', mailController.sendMail);
//#endregion

module.exports = routes;