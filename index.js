const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const express = require('express');
const qrcode = require('qrcode');
const socketIO = require('socket.io');
const http = require('http');
const mysql = require('mysql');
const excel = require('exceljs');
const moment = require('moment');
const db = require("./database.js");

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
//      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ],
  },
});

// index routing and middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.get('/', (req, res) => {
  res.sendFile('index.html', {root: __dirname});
});

var today  = new Date();
var now = moment(today, 'DD-MM-YYYY').format('HH:mm:ss DD-MM-YYYY');

io.on('connection', (socket) => {
  socket.emit('message', `${now} Connected`);
  client.on('qr', (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit("qr", url);
      socket.emit('message', `${now} QR Code received`);
    });
  });
  client.on('ready', () => {
    socket.emit('message', `${now} WhatsApp is ready!`);
  });
  client.on('authenticated', (session) => {
    socket.emit('message', `${now} Whatsapp is authenticated!`);
  });
  client.on('auth_failure', function(session) {
    socket.emit('message', `${now} Auth failure, restarting...`);
  });
  client.on('disconnected', function() {
    socket.emit('message', `${now} Disconnected`);
  });
});

client.on('loading_screen', (percent, message) => {
  console.log('LOADING SCREEN', percent, message);
});
client.on('authenticated', (session) => {
  console.log('message', `${now} Whatsapp is authenticated!`);
});
client.on('ready', () => {
  console.log('message', `${now} WhatsApp is ready!`);
});

//function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};
function menuInfo() {
  client.sendMessage(msg.from, "Balas pesan ini untuk melanjutkan,\n\n*list* - _ringkasan data_ \n*add* - _menambah data_ \n*erase* - _hapus data_ \n*excel* - _unduh data excel_");
};
function tabelContoh() {
  mapCh.set(kontak.number+"tabel", "_Contoh, BM1234QF_");
  mapCh.set(kontak.number+"tanggal", "_Contoh, 30121999_");
  mapCh.set(kontak.number+"odo", "_Contoh, XXXXXX_");
  mapCh.set(kontak.number+"refuel", "_Contoh, 45L_");
  mapCh.set(kontak.number+"bbm", "_Contoh, biosolar_");
  mapCh.set(kontak.number+"alert", "*Tulisan yang di cetak miring adalah contoh yg harus di isi*");
  mapCh.set(kontak.number+"tabsql", undefined);
  mapCh.set(kontak.number+"tglsql", undefined);
  mapCh.set(kontak.number+"odosql", undefined);
  mapCh.set(kontak.number+"fuelsql", undefined);
  mapCh.set(kontak.number+"bbmsql", undefined);
  mapCh.set(kontak.number+"rangesql", undefined);
  mapCh.set(kontak.number+"kmplsql", undefined);
  mapCh.set(kontak.number+"odolast", undefined);
};
function clearMapCh() {
  mapCh.delete(kontak.number+"tabel");
  mapCh.delete(kontak.number+"tanggal");
  mapCh.delete(kontak.number+"odo");
  mapCh.delete(kontak.number+"refuel");
  mapCh.delete(kontak.number+"bbm");
  mapCh.delete(kontak.number+"alert");
  mapCh.delete(kontak.number+"alert2");
  mapCh.delete(kontak.number+"tabsql");
  mapCh.delete(kontak.number+"tglsql");
  mapCh.delete(kontak.number+"odosql");
  mapCh.delete(kontak.number+"fuelsql");
  mapCh.delete(kontak.number+"bbmsql");
  mapCh.delete(kontak.number+"rangesql");
  mapCh.delete(kontak.number+"kmplsql");
  mapCh.delete(kontak.number+"odolast");
};
function tabelBbmAwal() {
  client.sendMessage(msg.from, "\t*Tabel input pengisian BBM*\t \n\t------------------------------------------\t\n\t*PlatNomor*\t: \t"+mapCh.get(kontak.number+"tabel")+"\t\n\t*Tanggal*    \t: \t"+mapCh.get(kontak.number+"tanggal")+"\t\n\t*ODO*           \t: \t"+mapCh.get(kontak.number+"odo")+"\t\n\t*Liter*           \t: \t"+mapCh.get(kontak.number+"refuel")+"\t\n\t*BBM*           \t: \t"+mapCh.get(kontak.number+"bbm")+"\t\n\t------------------------------------------\t\n\t"+mapCh.get(kontak.number+"alert")+"\t");
};
function tabelBbm() {
  msg.reply("\t*Tabel input pengisian BBM*\t \n\t------------------------------------------\t\n\t*PlatNomor*\t: \t"+mapCh.get(kontak.number+"tabel")+"\t\n\t*Tanggal*    \t: \t"+mapCh.get(kontak.number+"tanggal")+"\t\n\t*ODO*           \t: \t"+mapCh.get(kontak.number+"odo")+"\t\n\t*Liter*           \t: \t"+mapCh.get(kontak.number+"refuel")+"\t\n\t*BBM*           \t: \t"+mapCh.get(kontak.number+"bbm")+"\t\n\t------------------------------------------\t\n\t"+mapCh.get(kontak.number+"alert")+"\t\n\t"+mapCh.get(kontak.number+"alert2")+"\t");
};
function cekDef() {
  if (mapCh.get(kontak.number+"tabsql") == undefined) {
    mapCh.set(kontak.number+"alert2", "_Ketik plat nomer kendaraan, *tanpa spasi*_");
  } else if (mapCh.get(kontak.number+"tglsql") == undefined) {
    mapCh.set(kontak.number+"alert2", "_Isi tanggal pengisian BBM dgn *DD/MM/YYYY*_");
  } else if (mapCh.get(kontak.number+"odosql") == undefined) {
    mapCh.set(kontak.number+"alert2", "_*ODO meter* kosong_");
  } else if (mapCh.get(kontak.number+"fuelsql") == undefined) {
    mapCh.set(kontak.number+"alert2", "_Jumlah *BBM diakhiri dengan huruf L*_");
  } else if (mapCh.get(kontak.number+"bbmsql") == undefined) {
    mapCh.set(kontak.number+"alert2", "_*Jenis BBM* kosong_");
  } else {
    mapCh.set(kontak.number+"alert", "*Tabel telah terisi seluruhnya*");
    mapCh.set(kontak.number+"alert2", "_ketik *𝐒𝐔𝐁𝐌𝐈𝐓* untuk menyimpan_");
  };
};
const member = [];
const mapCh = new Map();

client.on('message', async msg => {
  mode1 = mapCh.get(kontak.number+"_mode1");
  if (mode1 == null) {
    mapCh.set(kontak.number+"_mode1", "stop");
    mode1 = mapCh.get(kontak.number+"_mode1");
  };
  console.log("[+"+kontak.number+"]["+kontak.pushname+"]["+mode+"]"+msg.body);
  switch (msg.body.toLowerCase()) {
    case "info":
      if (kontak.number == member) {
        if (mode1.toLowerCase() == "info") return;
        mapCh.set(kontak.number+"_mode1", "info");
        mode1 = mapCh.get(kontak.number+"_mode1");
        sleep(1000);
        client.sendMessage(msg.from, `▂▃▄▅▆▇ ${kontak.pushname} ▇▆▅▄▃▂\n_Selamat datang di *hitung cepat dan automasi*. Sistem ini siap memberikanmu informasi terkini_`);
        sleep(500);
        menuInfo();
      } else {
        mapch.set(kontak.number+"_mode2", "info");
      };
      
    break;
    case "stop":
      if (mode.toLowerCase() == "stop") return;
      mapCh.set(kontak.number + "_mode", "stop");
      mode = mapCh.get(kontak.number+"_mode");
      client.sendMessage(msg.from, "〄🇸🇮🇸🇹🇪🇲 🇹🇪🇱🇦🇭 🇩🇮 🇭🇪🇳🇹🇮🇰🇦🇳〄\n_untuk mengaktifkannya kembali, ketik *info*_");
    break;
  };
});


client.initialize();

server.listen(PORT, () => {
  console.log('App listen on port ', PORT);
});