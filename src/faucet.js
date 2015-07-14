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
  client.Transactions.Get([ '0c3ccbea4d33ad138fda382b6e6f8b0e168a1e0f1f193785ce9f387ed765c8f5',
  '9d1f8c4998cf0db86c3987a3565db8f34ac57d08c50c5656f1c9dba352361c59',
  '1a545b9b72d69fb6e07f582f2c70fd623eca717b96bb4b5c2e2022acdedc0c58',
  '0af794479e2d29e2418832e26bca2d4482db5b4579e50bce0e2bb47eca1faf65',
  '8ad7c333c944ed6003dfe8ec13008b7774db81da2209985c44c85c66eb95fcf9',
  '48a6b912ae7372e4b02de5201188f9bd8b9b30bc5e495e384ae08bc6abf5fabc',
  '98c95fb5543d08a99e60eb1dfd19d7bd661ec535ce3bd503f74ef6f1ec953f90',
  '2c35d376cfb71beaa6649986f24d76b9d6e9b9d38aa735ff5e79e604c24f31dc'], callback);
}



var Faucet = function (opts) { 
  var commonBlockchain = require('blockcypher-unofficial')({
    network: opts.network
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
  var LastRecieved = function(options, callback) {
    getTxids(commonBlockchain, options, function (err, txids) {
      filterTransactions(commonBlockchain, txids, options, callback);
      // commonBlockchain.Transactions.Get(resp, function (err2, resp2){
      //   if (err2) {
      //     callback(err2, null);
      //   }
      //   else {
      //     console.log(resp2);
      //     // for(var i = 0; i < resp.length; i++) {
      //     // //   if (resp[0][i].vin[0].addresses && (resp[0][i].vin[0].addresses[0] === options.faucetAddress)) {
      //     // //     faucetTransactionTimes.push(new Date().getTime() - resp[0][i].timeRecieved);
      //     // //   }
      //     // console.log("hello");
      //     // }
      //     //callback(false, ((faucetTransactionTimes.length > 0) ? Math.min.apply(Math, faucetTransactionTimes) : null));
      //   }
      // });
    }); 
  }

  return({
    Send: Send,
    Balance: Balance,
    LastRecieved: LastRecieved
  });
};

module.exports = Faucet;