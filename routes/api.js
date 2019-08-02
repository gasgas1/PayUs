const express = require('express');

const gestioneAccount = require('../controller/gestioneAccount');
/*const gestioneTransazione = require('../controllers/gestioneTransazione');
const gestioneCarta = require('../controllers/gestioneCarta');
const gestioneContoBancario = require('../controllers/gestioneContoBancario');
const gestionePagamentoProgrammato  = require('../controllers/gestionePagamentoProgrammato');
const gestioneRichiestaPagamento = require('../controllers/gestioneRichiestaPagamento');
const gestioneSalvadanaio = require('../controllers/gestioneSalvadanaio');
const gestioneConto = require('../controllers/gestioneConto');*/

const router = express.Router();

//CheckIfLoggedIn
const cili = gestioneAccount.isUserLoggedIn;

//Gestione account

router.post('/utente', gestioneAccount.creaUtente);
router.get('/utente', cili , gestioneAccount.getUtente);
router.put('/utente', cili , gestioneAccount.modificaUtente);
router.delete('/utente', cili, gestioneAccount.eliminaUtente);
router.post('/login', gestioneAccount.login);
router.get('/logout', gestioneAccount.logout);
router.get('/confermaAccount/:codiceAttivazione', gestioneAccount.confermaAccount);
router.post('/recuperoPassword',gestioneAccount.recuperoPassword);
router.post('/modificaPassword', cili ,gestioneAccount.modificaPassword);
router.put('/notifica', cili, gestioneAccount.modificaFlagNotifica);
/*
//Gestione Transazione
router.post('/transazione', cili , gestioneTransazione.pagamento);
router.get('/transazione', cili, gestioneTransazione.getTransazioni);

//Gestione Carta
router.post('/carta', cili, gestioneCarta.creaCarta);
router.get('/carta', cili, gestioneCarta.datiCarta);
router.delete('/carta', cili, gestioneCarta.eliminaCarta);

//Gestione Conto Bancario
router.post('/contoCorrente', cili, gestioneContoBancario.creaContoBancario);
router.get('/contoCorrente', cili, gestioneContoBancario.datiContoBancario);
router.delete('/contoCorrente', cili, gestioneContoBancario.eliminaContoBancario);

//Gestione Pagamento Programmato
router.post('/pagamentoProgrammato', cili, gestionePagamentoProgrammato.creaPagamentoProgrammato);
router.get('/pagamentoProgrammato', cili, gestionePagamentoProgrammato.richiestaPagamentoProgrammato);
router.delete('/pagamentoProgrammato', cili, gestionePagamentoProgrammato.eliminaPagamentoProgrammato);

//Gestione Richiesta Pagamento
router.post('/richiestaPagamento', cili, gestioneRichiestaPagamento.creaRichiestaPagamento);
router.get('/richiestaPagamento', cili, gestioneRichiestaPagamento.richiestaDatiRichiestaPagamento);
router.put('/richiestaPagamento', cili, gestioneRichiestaPagamento.segnaComePagato);
router.delete('/richiestaPagamento', cili, gestioneRichiestaPagamento.eliminaRichiestaPagamento);

//Gestione Salvadanaio
router.get('/salvadanaio', cili, gestioneSalvadanaio.getTransazioniSalvadanaio);
router.post('/salvadanaio', cili, gestioneSalvadanaio.setBitSalvadanaio);
router.put('/salvadanaio', cili, gestioneSalvadanaio.modificaImportoMensile);
router.delete('/salvadanaio', cili, gestioneSalvadanaio.svuotaSalvadanaio);

//Gestione Conto
router.get('/conto', cili, gestioneConto.datiConto);
router.post('/conto', cili, gestioneConto.creaNuovoConto);
router.delete('/conto', cili, gestioneConto.eliminaConto);
router.post('/ricarica', cili, gestioneConto.ricaricaConto);
router.get('/estrattoConto', cili, gestioneConto.estrattoConto);
router.get('/valute', cili, gestioneConto.datiValute);
router.put('/conto', cili, gestioneConto.impostaLimiteSpesa);
router.put('/metodoPredefinito', cili, gestioneConto.impostaMetodoPredefinito);

*/
module.exports = router;