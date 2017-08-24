var gpio = require('rpio');
var menu = require('oled-menu');

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
  bus: 1,
  display: {
    width:128,
    height:64,
    address: 0x3C
  },
  gpio: gpio,
  pins: {
    up: 17,
    down: 22,
    enter: 4
  }
}

function shutdown(callback){
  exec('shutdown -h now', function(error, stdout, stderr){ callback(stdout) });
}
function reboot(callback){
  exec('shutdown -r now', function(error, stdout, stderr){ callback(stdout) });
}


var test = new menu(opts);
var test2 = new menu(opts);
var test3 = new menu(opts);
test.addElement("Hello",function(){console.log('test')});
test.addElement("Menu 2 >",function(){test2.runMenu()});
test.addElement("System Control >",function(){test3.runMenu()});
test2.addElement("Hello 2",function(){console.log('test2')});
test2.addElement("Back <",function(){test.runMenu()});
test3.addElement("Reboot",function(){reboot(console.log)});
test3.addElement("Shutdown",function(){shutdown(console.log)});
test3.addElement("Back <",function(){test.runMenu()});

gpio.init({mapping:"gpio"});
for (pin in pins){
  gpio.open(pins[pin],gpio.INPUT,gpio.PULL_UP);
}

test.runMenu();
