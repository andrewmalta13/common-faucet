var commonBlockchainClient = require('blockcypher-unofficial')({
  network: "testnet",
  key: process.env.KEY
});
var client = require('./index.js')({
  network: "testnet",
  commonBlockchainClient: commonBlockchainClient
});


function test(err, resp){
  if (err) {
    console.log("err: " + err);
  }
  else {
    console.log(resp);
  }
}

// client.Send({
//   faucetWIF: "cSvoPGyKQ26kUCqA3pTu3p7Ehn57tfgWHz2PdWtMS2AirRaFfuDu",
//   amount: .0001,
//   destinationAddress: "n3QjrSMbYUXubN3NFSxMRp1UVWBzrhBRjG"
// }, test);

// client.Balance("n3QjrSMbYUXubN3NFSxMRp1UVWBzrhBRjG", test);

client.LastReceived({
  faucetAddress: "mpA7LkZe8TKNMgTPJVbn5StQ6Yh28fXg1d",
  destinationAddress: "n3QjrSMbYUXubN3NFSxMRp1UVWBzrhBRjG" 
}, test);


