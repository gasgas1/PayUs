const mysql = require('mysql');


const pool = mysql.createPool({
    host:      '%',
    user:      'PayUs',
    password:  'f39dSNgzVbaAx5Wb',
    database:  'payus',
    multipleStatements: true,
    waitForConnections: true,
    queueLimit: 1000,
    connectionLimit: 100
});

/**
 * Funzione per insert generico nel database
 * @param {string} query Query per l'inserimento dei dati all'interno del db
 * @param {[]} params Parametri della query
 * @param {function} callback Funzione di callback
 */
exports.queryInserimento = function insertQuery(query, params, callback)
{
    pool.query(query, params, function(err, result, fields)
    {
        if(err)
        {
            console.log(err);
            callback(undefined, err);
        }
        else
        {
            callback(result.insertId, "OK");
        }
    })
};

/**
 * Funzione utile per richiede insiemi di dati memorizzati sul database. La callback viene chiamata con due parametri.
 * Il primo di questi rappresenti i dati ottenuti dala query, undefined nel caso in cui si verifichino errori, mentre
 * il secondo rappresenta l'esito dell'operazione.
 * @param {string} query - La query da eseguire.
 * @param {[]} queryData - I parametri da passare alla query.
 * @param {function} callback - La funzione da eseguire una volta terminata la query.
 */
exports.queryRichiesta = function dataRequestQuery(query, params, callback)
{

    pool.query(query, params, function (err, result, fields)
    {
        if (err)
        {
            callback(undefined, err);
        }
        else
        {
            callback(result, result.length > 0 ? 'OK' : 'NORESULT');
        }
    });
};
/**
 * Funzione utile per eseguire query in cui si deve verificare l'esistenza di specifiche tuple sul database,
 * ed eventualmente restituire la prima tupla di dati ottenuta dalla query (ad esempio in fase di login, quando si vuole
 * verificare se l'utente con le credenziali inserite esiste e in caso affermativo restituirne i dati completi).
 * @param {string} query - La query da eseguire.
 * @param {[]} queryData - I parametri da passare alla query.
 * @param {function} callback - La funzione da eseguire una volta terminata la query.
 * @param {Connection || Pool} [connection] - Connessione o pool tramite con cui eseguire la query.
 */
exports.queryConfronto = function matchQuery(query, queryData, callback, connection = pool)
{
    connection.query(query, queryData, function (err, result, fields) {
        if (err) {
            app.log(err);
            callback(undefined, 'CONNERR');
        } else callback(result[0], ((result.length > 0) ? 'OK' : 'NOMATCH'));
    });
};

/**
 * Funzione utile per eseguire query di aggiornamento di specifiche tuple sul database. La callback viene chiamata
 * con la stringa "OK" per segnalare l'esito positivo, nel caso in cui è stata aggiornata almeno una riga, e con
 * "NOMATCH" altrimenti.
 * @param {string} query - La query da eseguire.
 * @param {[]} queryData - I parametri da passare alla query.
 * @param {function} callback - La funzione da eseguire una volta terminata la query.
 * @param {Connection || Pool} [connection] - Connessione o pool tramite con cui eseguire la query.
 */
exports.queryAggiornamento = function updateQuery(query, queryData, callback, connection = pool)
{
    connection.query(query, queryData, function (err, result, fields) {
        if (err) {
            console.log(err);
            callback(null,'CONNERR');
        } else callback(null, ((result.affectedRows > 0) ? 'OK' : 'NOMATCH'));
    });
};



/**
 * Funzione utile per eseguire query generiche. Chiama la callback con "OK" se l'operazione va a buon fine, e con
 * "CONNERR" altrimenti.
 * @param {string} query - La query da eseguire.
 * @param {[]} queryData - I parametri da passare alla query.
 * @param {function} callback - La funzione da eseguire una volta terminata la query.
 * @param {Connection || Pool} [connection] - Connessione o pool tramite con cui eseguire la query.
 */
exports.queryGenerica = function genericQuery(query, queryData, callback, connection = pool)
{
    connection.query(query, queryData, function (err, result, fields) {
        if (err) {
            console.log(err);
            callback('CONNERR');
        } else callback('OK');
    });
};