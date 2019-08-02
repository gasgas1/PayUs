const db = require('../database');

/**
 * Funzione per inserire un nuovo utente nel db
 */
exports.creaUtente = function(email, nome, cognome,nazione,citta,indirizzo,num_civico,cap,sesso,data_nascita,registrato,password,num_telefono,callback)
{
    exports.utenteRegistratoDaAltroAccount(email, function (giaRegistrato)
    {
        if(giaRegistrato)
        {
            exports.modificaUtente(email, nome, cognome,nazione,citta,indirizzo,num_civico,cap,sesso,data_nascita,0,password,num_telefono, undefined,undefined,undefined,undefined,callback);
        }
        else
        {
            const queryInserimento = "INSERT INTO Utente (email, nome, cognome,nazione,citta,indirizzo,num_civico,cap,sesso,data_nascita,registrato,password,num_telefono)"
                + "VALUES (?,?,?,?,?,?,?,?,?,?,?,?);";

            db.queryInserimento(queryInserimento, [email, nome, cognome,nazione,citta,indirizzo,num_civico,cap,sesso,cod_telegram,
                data_nascita,password,num_telefono === true, registrato || false],callback);
        }
    });

};

/**
 * Funzione per richiedere i dati di un utente
 * @param email email dell'utente di cui si vogliono avere i dati
 * @param callback funzione chiamata una volta ottenuti i dati
 */
exports.richiestaUtente = function (email, callback)
{
    const queryRichiesta = "SELECT * FROM Utente WHERE email = ?";
    db.queryRichiesta(queryRichiesta, [email], callback);
};

exports.modificaUtente = function (email, nazione, citta, indirizzo, cap, num_telefono, callback)
{
    exports.richiestaUtente(email, function (result, msg)
    {
        if(msg === "OK")
        {

            if(nazione !== undefined && nazione !== null)
                result.nazione = nazione;

            if(citta !== undefined && citta !== null)
                result.citta = citta;

            if(indirizzo !== undefined && indirizzo !== null)
                result.indirizzo = indirizzo;

            if(cap !== undefined && cap !== null)
                result.cap = cap;

            if(num_telefono !== undefined && num_telefono !== null)
                result.num_telefono = num_telefono;

            const queryModifica = "UPDATE Utente SET " +
                "nazione = ?," +
                "citta = ?," +
                "indirizzo = ?," +
                "cap = ?," +
                "num_telefono = ?" +
                "WHERE email = ?;";

            db.queryAggiornamento(queryModifica,[result.nazione ,result.citta,result.indirizzo,result.cap,result.num_telefono, email], callback);
        }
    });
};

exports.eliminaUtente = function(email, callback)
{
    const queryEliminazione = "DELETE FROM Utente WHERE email = ?";
    db.queryGenerica(queryEliminazione, [email], callback);
};

exports.autentica = function(email, callback)
{
    const query = "SELECT password, confermaAccount FROM utente WHERE email = ?;";

    db.queryRichiesta(query,[email], callback);
};

exports.confermaAccount = function (codiceAttivazione, callback)
{
    const query = "UPDATE Utente SET confermaAccount = NULL WHERE confermaAccount = ?;";

    db.queryAggiornamento(query, [codiceAttivazione], callback);
};

exports.modificaPassword = function (email, nuovaPassword, callback)
{
    const query = "UPDATE Utente SET password = ? WHERE email = ?;";

    db.queryAggiornamento(query, [nuovaPassword,email], callback);
};




exports.utenteRegistrato = function (emailUtente, callback)
{
    const query = "SELECT email FROM Utente WHERE email = ?";

    return db.queryRichiesta(query,[emailUtente], function (result, msg)
    {
        if(msg === 'NORESULT')
            callback(false);
        else
            callback(true);
    });
};

exports.utenteRegistratoDaAltroAccount = function (emailUtente, callback)
{
    exports.utenteRegistrato(emailUtente, function (registrato)
    {
        if(registrato)
        {
            const query = "SELECT registrato FROM utente WHERE email = ?;";

            db.queryRichiesta(query, [emailUtente], function (result, msg)
            {
                if(msg === 'OK')
                {
                    if(result[0].registrato === 1)
                    {
                        callback(true);
                    }
                    else
                    {
                        callback(false);
                    }
                }
            });
        }
        else
        {
            callback(false);
        }

    });
};

exports.accountPerIdTelegram = function (codiceTelegram, callback)
{
    const query = "SELECT * FROM Utente WHERE cod_telegram = ?;";

    db.queryRichiesta(query, [codiceTelegram],callback);
};

exports.setIdAccountTelegram = function (email, idChat, callback)
{
    const query = "UPDATE Utente set idAccountTelegram = ? WHERE email = ?;";

    db.queryAggiornamento(query, [idChat, email], callback);
};


