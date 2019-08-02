const Joi = require('joi');
const bcrypt = require('bcrypt');
const utenteDao = require("../dao/utenteDao");
/*const contoDao = require("../dao/contoDao");*/
const mailer = require("../mailer");
const passwordBuilder = require('generate-password');


exports.creaUtente = function (req, res)
{
    //Valido i dati
    const schema = {
        email :         Joi.string().email().max(100).required(),
        nome :          Joi.string().max(50).allow('').required(),
        cognome :       Joi.string().max(50).allow('').required(),
        nazione :   Joi.string().max(50).allow(''),
        citta :         Joi.string().max(50).allow(''),
        indirizzo :     Joi.string().max(50).allow(''),
        num_civico:     Joi.string().max(50).allow(''),
        cap :           Joi.string().max(5).allow(''),
        sesso :         Joi.string().max(1).regex(/^([MF])/).allow(''),
        data_nascita : Joi.date().max("now").allow(''),
        password :      Joi.string().max(50).required(),
        num_telefono :      Joi.string().max(15).required(),


    };

    const result = Joi.validate(req.body, schema);

    if(result.error === null)
    {
        const data = req.body;

        bcrypt.hash(data.password, 5, function (err, hashPassword)
        {
            console.log(err);
            if(data.data_nascita !== undefined)
                data.data_nascita = data.data_nascita.replace('T', ' ').replace('Z','');
            else
                data.data_nascita = null;

            if(data.data_nascita === '')
                data.data_nascita = null;


            console.log(data.data_nascita);
            utenteDao.creaUtente(data.email, data.nome, data.cognome, data.data_nascita, data.sesso, data.nazione, data.citta, data.indirizzo, data.cap,data.num_civico, data.num_telefono, hashPassword || false, false, (result,msg) =>
            {
                if(msg === 'OK')
                {
                    utenteDao.modificaValuta(data.email, data.valuta, function (result, msg)
                    {
                        if(msg === 'OK')
                        {
                            utenteDao.richiestaUtente(data.email, function (result, msg)
                            {
                                if(msg === 'OK')
                                {
                                    mailer.inviaMailDiConferma(data.nome || "",data.email,"/api/confermaAccount/" + result[0].confermaAccount, function ()
                                    {
                                        res.send({success: true, message:'Utente registrato.'});
                                    });
                                }
                                else
                                {
                                    res.send({success: false, error:msg});
                                }
                            });
                        }
                        else
                        {
                            res.send({success: false, error: "Errore modifica valuta"});
                        }
                    });
                }
                else
                {
                    res.send({success: false, error:"Esiste già un utente registrato con questa email"});
                }
            });
        });
    }
    else
    {
        res.send({success: false, error: result.error.message});
    }

};

exports.getUtente = function(req, res)
{
    utenteDao.richiestaUtente(req.session.email, (result, msg) =>
    {
        if(msg === "OK")
        {
            res.send({success: true, data: result});
        }
        else
        {
            res.send({success: false, error:msg});
        }
    });
};

exports.login = function (req, res) {
    const result = Joi.validate(req.body.email, Joi.string().email().required());

    if(result.error === null)
    {
        utenteDao.autentica(req.body.email, function (result, msg)
        {
            if(msg === "OK")
            {
                if(result[0].confermaAccount === null)
                {
                    bcrypt.compare(req.body.password, result[0].password, function(err, resultHash)
                    {
                        if(resultHash === true)
                        {
                            req.session.email = req.body.email;

                            contoDao.richiestaDatiConto(req.session.email, function (data, msg)
                            {
                                if(msg === 'OK')
                                {
                                    //Ritorno la valuta del conto principale
                                    res.send({success:true, data: data[0].valuta});
                                }
                                else
                                {
                                    res.send({success:false, error: "Errore recupero dati conto"});
                                }
                            });
                        }
                        else
                        {
                            res.send({success:false, error:"Password errata"});
                        }
                    });
                }
                else
                {
                    res.send({success:false, error:"Account non attivo"});
                }
            }
            else
            {
                res.send({success: false, error: "Email non presente"});
            }
        });
    }
};

exports.logout = function (req, res)
{
    req.session.email = undefined;
    res.send({success: true, data:"Utente sloggato"});
};

/*exports.confermaAccount = function (req, res)
{
    const result = Joi.validate(req.params.codiceAttivazione, Joi.string().min(32).max(32).required());
    if(result.error === null)
    {
        utenteDao.confermaAccount(req.params.codiceAttivazione, function (result,msg)
        {
            if(msg === 'OK')
            {
                res.redirect('/');
            }
            else
            {
                res.send({success: false, error:"Codice attivazione non valido"});
            }
        });
    }
    else
    {
        res.send({success:false, error:"Codice attivazione non valido"});
    }
};*/

exports.recuperoPassword = function (req, res)
{
    const result = Joi.validate(req.body.email, Joi.string().email().required());

    if(result.error === null)
    {
        //modifico la password nel database
        const nuovaPassword = passwordBuilder.generate({length:8, numbers: true});

        bcrypt.hash(nuovaPassword, 5, function (err, hash)
        {
            utenteDao.modificaPassword(req.body.email, hash,function (result, msg)
            {
                if(msg === 'OK')
                {
                    mailer.inviaMailRipristinoPassword(req.body.email, nuovaPassword, function()
                    {
                        res.send({success:true, data:"E' stata inviata una mail per il recupero della password"});
                    });
                }
                else
                {
                    res.send({success:false, error: "Nessun account associato alla mail"});
                }
            });
        });


    }
    else
    {
        res.send({success: false, error: "Email non inserita"});
    }
};

exports.modificaFlagNotifica = function(req, res)
{
    const schema = {
        notificaEmail: Joi.boolean().required(),
        notificaWaTg: Joi.boolean().required()
    };

    const result = Joi.validate(req.body, schema);

    if(result.error === null)
    {
        const email = exports.loggedUser(req, res);

        utenteDao.modificaFlagNotifiche(email, req.body.notificaEmail, req.body.notificaWaTg, function (result, msg)
        {
            if(msg === 'OK')
            {
                res.send({success: true, data:"Flag modificati"});
            }
            else
            {
                res.send({success: false, error:"Impossibile modificare i bit"});
            }
        })
    }
    else
    {
        res.send({success: false, error: result.error});
    }
};

exports.modificaUtente = function (req, res)
{
    //Valido i dati
    const schema = Joi.object().keys({
        nazione :   Joi.string().max(45).allow(''),
        citta :         Joi.string().max(45).allow(''),
        indirizzo :     Joi.string().max(45).allow(''),
        num_civico :     Joi.string().max(45).allow(''),
        cap :           Joi.string().max(5).allow(''),
        num_telefono :      Joi.string().max(15).allow(''),
    });

    const result = Joi.validate(req.body, schema);

    if(result.error === null)
    {
        const b = req.body;
        b.email = exports.loggedUser(req, res);

        utenteDao.modificaUtente(b.email, b.nazione, b.citta, b.indirizzo, b.cap,b.num_civico, b.num_telefono,function (result, msg)
        {
            if(msg === 'OK')
            {
                res.send({success:true, data:"Dati utente modificati"});
            }
            else
            {
                res.send({success:false, error:"Errore aggiornamento dati" + msg});
            }
        })
    }
    else
    {
        res.send({success:false, error: result.error});
    }
};

exports.eliminaUtente = function (req, res)
{
    utenteDao.eliminaUtente(req.session.email, function (msg)
    {
        if(msg === 'OK')
        {
            res.send({success: true, data:"Utente eliminato"});
        }
        else
        {
            res.send({success: false, error:"Impossibile eliminare l'utente"});
        }
    });
};

//Middleware per controllare se l'utente è loggato
exports.isUserLoggedIn = function(req, res, next)
{
    if(req.session.email !== undefined && req.session.email !== null)
    {
        const isEmail = Joi.validate(req.session.email, Joi.string().email());
        if(isEmail.error === null)
        {
            next();
        }
        else
        {
            res.send({success: false, error:"Utente non loggato"});
        }
    }
    else
    {
        res.send({success: false, error:"Utente non loggato"});
    }


};

//Ritorna l'email dell'utente loggato
exports.loggedUser = function (req, res)
{
    if(req.session.email !== undefined && req.session.email !== null)
        return req.session.email;
    else
        res.send({success: false, error: "Utente non loggato"});

    return null;
};

//Funzione che crea un account ad un utente che non è registrato per accreditargli il pagamento
/*exports.creaUtentePerTransazione = function (email, valuta, callback)
{
    utenteDao.creaUtente(email,null,null,null,null,null,null,null,null,null,null,null,true, function (result, msg)
    {
        if(msg === 'OK')
        {
            utenteDao.modificaValuta(email, valuta, callback);
        }
        else
        {
            console.log("problema creazione utente");
        }
    });
};*/

exports.modificaPassword = function (req, res)
{
    const schema = {
        passwordVecchia: Joi.string().required(),
        passwordNuova:  Joi.string().required()
    };

    const result = Joi.validate(req.body, schema);

    if(result.error === null)
    {
        const email = exports.loggedUser(req, res);

        utenteDao.autentica(email,function (result, msg)
        {
            if(msg === 'OK')
            {
                const psw = result[0].password;

                bcrypt.compare(req.body.passwordVecchia, psw, function (err, combacia)
                {
                    if(combacia)
                    {
                        bcrypt.hash(req.body.passwordNuova, 5, function (err, hash)
                        {
                            utenteDao.modificaPassword(email, hash,function (result, msg)
                            {
                                if(msg === 'OK')
                                {
                                    res.send({success:true, data:"Password modificata con successo"});
                                }
                                else
                                {
                                    res.send({success:false, error: "Impossibile modificare la password"});
                                }
                            });
                        });
                    }
                    else
                    {
                        res.send({success: false, error:"La vecchia password non combacia"});
                    }
                });
            }
            else
            {
                res.send({success: false, error: "Errore account"});
            }
        });
    }
    else
    {
        result.send({success: false, error: result.error});
    }

};

