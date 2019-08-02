const cron = require('node-cron');
const gestioneAccount = require('./controllers/gestioneAccount');
const transazioneDao = require('./dao/transazioneDao');
const pagamentoProgrammatoDao = require('./dao/pagamentoProgrammatoDao');
const mailer = require("./mailer");
const {getSalvadanaioEventoMensile} = require('./dao/contoDao');

exports.init = function()
{
    //Ogni giorno a mezzanotte
    cron.schedule('0 0 0 * * *', function ()
    {
        pagamentoProgrammatoDao.richiestaDati(function (result, msg)
        {
            if(msg === 'OK')
            {
                for(let i = 0; i < result.length; ++i)
                {
                    const a = result[i];

                    //const dataInizio = new Date(dataInizio);

                    if(a.ripetizioni > 0 || a.ripetizioni === -1)
                    {
                        const ultimoPagamento = new Date(a.dataUltimoPagamento);

                        const dataAttuale = new Date('now');

                        const diff = numDaysBetween(ultimoPagamento, dataAttuale);

                        if(diff >= a.periodicita)
                        {
                            pagamento(a.emailOrdinante, a.emailBeneficiario, a.valuta, a.importo, a.causale);

                            const nuoveRipetizioni = (a.ripetizioni === -1)? -1 : a.ripetizioni-1;

                            pagamentoProgrammatoDao.aggiornaDataPagamento(a.id, nuoveRipetizioni, function (msg)
                            {
                                if(msg === 'OK')
                                    console.log('Pagamento effettutato.');
                            });
                        }
                    }
                }
            }
        });
    }, null);

    console.log("pagamenti programmati inizializzati");

    //Evento mensile salvadananio
    //Ogni primo del mese
    cron.schedule("0 0 1 * *",function ()
    {
        getSalvadanaioEventoMensile(function (result, msg)
        {
            if(msg === 'OK')
            {
                for(let i = 0; i < result.length; ++i)
                {
                    const pagamento = result[i];

                    transazioneDao.creaTransazione(pagamento.importo,pagamento.valuta, "Evento salvadananio mensile",false, true, false, pagamento.email, pagamento.email, function (result, msg)
                    {
                        if(msg === 'OK')
                            console.log("Evento mensile arrotondamento effettuato.");
                    });
                }
            }
            else
            {
                console.log("Errore evento mensile salvadanaio");
            }
        });
    },null);
};







function pagamento(refOrdinante, refBeneficiario, valuta, importo, causale)
{
    transazioneDao.idContoBeneficiario(valuta, refBeneficiario, function (result, msg)
    {
        if(msg === 'OK')
        {
            const idContoBeneficiario = result[0].idContoBeneficiario;

            const emailUser = gestioneAccount.loggedUser();

            transazioneDao.idContoPerValuta(emailUser , valuta, function (id, msg)
            {
                if(msg === 'OK')
                {
                    const idContoOrdinante = id[0].idConto;

                    contoDao.richiestaDatiConto(idContoOrdinante, function (data, msg)
                    {
                        if(msg === 'OK')
                        {
                            if(data.saldo >= valuta)
                            {
                                transazioneDao.pagamento(Number(importo), causale, false, false, idContoOrdinante, idContoBeneficiario, function (msg)
                                {
                                    if(msg === 'OK')
                                    {
                                        console.log({success: true, data:"Transazione effettuata con successo"});
                                    }
                                    else
                                    {
                                        console.log({success: false, error:"Transazione fallita" + msg});
                                    }
                                });
                            }
                            else
                            {
                                mailer.inviaMailNotificaFallimento(emailUser, function (msg)
                                {
                                    console.log('Invio mail notifica fallimento pagamento.');
                                });
                            }

                        }
                    });


                }
            });


        }
        else
        {
            console.log({success: false, error:"Conto non disponibile o utente errato" + msg});
        }
    });
}

function numDaysBetween(d1, d2) {
    var diff = Math.abs(d1.getTime() - d2.getTime());
    return diff / (1000 * 60 * 60 * 24);
}