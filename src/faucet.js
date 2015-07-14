var bitcoin = require('./bitcoin.js');

function getTxids(client, options, callback){
  if (!options.faucetAddress || !options.destinationAddress) {
    callback("insufficient arguments supplied", null);
  }
  var txids = [];
  var faucetTransactionTimes = [];
  client.Addresses.Transactions([options.destinationAddress], function (err, resp) {
    if (err) {
      callback(err, null);
    }
    else {
      for(var i = 0; i < resp[0].length; i++) {
        txids.push(resp[0][i].txid);
      }
      callback(false, txids);
    }
  });
}

function filterTransactions(client, txids, options, callback) {
  var faucetTransactionTimes = [];
  client.Transactions.Get(txids, function (err, resp){
    if (err) {
      callback(err, null);
    }
    else {
      for(var i = 0; i < resp.length; i++) {
        if (resp[i].vin[0].addresses && (resp[i].vin[0].addresses[0] === options.faucetAddress)) {
          faucetTransactionTimes.push((new Date().getTime()) - resp[i].timeReceived);
        }
      callback(false, ((faucetTransactionTimes.length > 0) ? Math.min.apply(Math, faucetTransactionTimes) : null));
    }
  });
}

var Faucet = function (opts) { 
  var commonBlockchain = require('blockcypher-unofficial')({
    network: opts.network,
    key: opts.key
  });

  var Send = function (options, callback){
    if (!options.faucetWIF || !options.amount || !options.destinationAddress) {
      callback("missing arguments", null);
    }
    else {
      var faucetAddress = bitcoin.getAddressFromWIF(options.faucetWIF, opts.network);
      if (faucetAddress === null) {
        callback("invalid faucet wif", null);
      }
      else {
        commonBlockchain.Addresses.Unspents(["mpA7LkZe8TKNMgTPJVbn5StQ6Yh28fXg1d"], function (err, resp){
          if (err) {
            callback("error getting unspents from address", null);
          }
          else {
            var buildTxOptions = {
              amountForDestinationInBTC: options.amount,
              destinationAddress: options.destinationAddress,
              network: opts.network,
              propagateCallback: commonBlockchain.Transactions.Propagate,
              rawUnspentOutputs: resp[0],
              sourceWIF: options.faucetWIF
            };
            bitcoin.buildTransaction(buildTxOptions, function (error, response){
              if (error) { 
                callback(error, null);
              }
              else {
                callback(false, response);
              }
            });
          }
        });
      } 
    }
  };

  var Balance = function(options, callback){
    if (!options.address) {
      callback("no address specified", null);
    }
    else {
      commonBlockchain.Addresses.Summary([options.address], function (err, resp) {
        if (err) {
          callback("error retrieving balance from the address that was given", null);
        }
        else {
          callback(false, resp[0].balance);
        }
      });
    }
  };
  
  //a function to see if a specific address has recieved coin(s) from the specified faucet address
  //if so it will return how long ago (in milliseconds) otherwise null.

  //Warning, blockcypher limits your requests pretty heavily if you dont have a api key (get one to perform this funcition)
  var LastRecieved = function(options, callback) {
    getTxids(commonBlockchain, options, function (err, txids) {
      filterTransactions(commonBlockchain, txids, options, function (err, resp){
        callback(err, resp);
      });
    }); 
  }

  return({
    Send: Send,
    Balance: Balance,
    LastRecieved: LastRecieved
  });
};

module.exports = Faucet;