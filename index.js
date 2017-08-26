var gpio = require('rpio');
var menu = require('oled-menu');
var input = require('oled-pin-input');
var exec = require('child_process').exec;
var i2c = require('i2c-bus');
var crypto = require('crypto');
var oled = require('oled-i2c-bus');
var font = require('oled-font-5x7');

var i2cBus = i2c.openSync(1);
var algorithm = 'aes-256-ctr';
var pin = "";
var passwords = require('./passwords.json');

var pins = {
  L: 27,
  R: 23,
  C: 4,
  U: 17,
  D: 22,
  A: 5,
  B: 6
}

var opts = {
  bus: i2cBus,
  display: {
    width:128,
    height:64,
    address: 0x3C
  },
  title: 'Pin Input',
  gpio: gpio,
  pins: {
    up: 17,
    down: 22,
    enter: 4,
    next: 23,
    back: 27
  }
}

oled = new oled(opts.bus,opts.display);

function shutdown(callback){
  exec('shutdown -h now', function(error, stdout, stderr){ callback(stdout) });
}
function reboot(callback){
  exec('shutdown -r now', function(error, stdout, stderr){ callback(stdout) });
}

var main = new menu(opts);
var config = new menu(opts);
var getPin = new input(opts,function(newPin){
  pin = newPin;
  main.runMenu();
});
main
  .addTab("PassVault")
  .addTab("Options")
  .addTab("System")
  .addElement("Show Password","PassVault",function(){main.close();openVault(main)})
  .addElement("Unlock","PassVault",function(){main.close();getPin.runInput()})
  .addElement("Config","Options",function(){main.close();config.runMenu(main)})
  .addElement("Reboot","System",function(){reboot(console.log)})
  .addElement("Shutdown","System",function(){shutdown(console.log)})
  .addElement("Reload","System",function(){main.close();process.exit()})

config
  .addTab("Config")
  .addElement("Set Pin","Config",function(){console.log('test4')})

var openVault = function(last){
  var vault = new menu(opts);
  vault.addTab("Passwords");
  for(name in passwords){
    vault.addElement(name,"Passwords",function(){vault.close();decryptAndDisplay(name)});
  }
  vault.runMenu(last);
}

function decryptAndDisplay(name){
  oled.clearDisplay(false);
  var decipher = crypto.createDecipher(algorithm,pin);
  var dec = decipher.update(passwords[name],'hex','utf8');
      dec += decipher.final('utf8');
  oled.setCursor(3,3);
  oled.writeString(font,1,dec,1,true,false);
  oled.update();
  console.log(dec);
  setTimeout(main.runMenu.bind(main),2000);
}

gpio.init({mapping:"gpio"});
for (pin in pins){
  gpio.open(pins[pin],gpio.INPUT,gpio.PULL_UP);
}

main.runMenu();
