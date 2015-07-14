var client = require('./index.js')({network: "testnet"});

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

// client.Balance({address: "n3QjrSMbYUXubN3NFSxMRp1UVWBzrhBRjG"}, test);

client.LastRecieved({
  faucetAddress: "mpA7LkZe8TKNMgTPJVbn5StQ6Yh28fXg1d",
  destinationAddress: "n3QjrSMbYUXubN3NFSxMRp1UVWBzrhBRjG" 
}, test);


