var crypto = require('crypto')
var fs = require('fs')
var generate = require('generate-password').generate;

var args = process.argv
var algorithm = 'aes-256-ctr'
var pin = args[2];
var name = args[3];

var passwords = require('./passwords.json');

if(passwords[name]){
  if(args[4] != "true"){
    console.log("Password Exists, pass true as 3 arg to ignore");
  }
}

var cipher = crypto.createCipher(algorithm,pin);
var password = generate({
  length: 12,
  numbers: true
});
var crypted = cipher.update(password,'utf8','hex');
    crypted += cipher.final('hex');
passwords[name] = crypted;
fs.writeFileSync('./passwords.json',JSON.stringify(passwords));
    
