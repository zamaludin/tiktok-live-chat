const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
let printer = new ThermalPrinter({
    type: PrinterTypes.STAR,                                  // Printer type: 'star' or 'epson'
    interface: 'printer:thermalprinter',                       // Printer interface
                                   // Printer character set - default: SLOVENIA
    removeSpecialCharacters: false,                           // Removes special characters - default: false
                                     // Set character for lines - default: "-"
    options:{                                                 // Additional options
      timeout: 5000                                           // Connection timeout (ms) [applicable only for network printers] - default: 3000
    }
  });
printer.alignCenter();
printer.println("Hello world");
printer.openCashDrawer();                                   // Kick the cash drawer
printer.cut();  
console.log("end");         