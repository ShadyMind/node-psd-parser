const bluebird = require('bluebird');
const path = require('path');
const fs = require('fs');
const { COLOR_MODES } = require('./constants');

request(path.resolve(__dirname, 'assets.psd'), function (content) {
  "use strict";
  content = Buffer.from(content);
  const header = parseHeader(content.slice(0, 26), '.psd');
  let colorModes = {
    count: 0,
    data: []
  };
  if ([COLOR_MODES[2], COLOR_MODES[8]].indexOf(header.colorMode) !== -1) {
    colorModes = parseColorModes(content.slice(26));
  }
  const images = parseImages(content.slice(30 + (colorModes.bytesLength || 0)));
  const psd = { content, header, colorModes, images };
  console.log(psd);
  
});


function request (url, fn) {
  "use strict";
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function() {
    fn(this.responseText);
  };
  
  xhr.onerror = function() {
    alert('Ошибка ' + this.status);
    
  };
  xhr.send();
}

function bytesToNumber (bytes) {
  return bytes.reduce((acc, num) => acc += num, 0)
}

function parseHeader (bytes, ext) {
  const header = {};
  header._sig = bytes.slice(0, 4).toString();
  if (header._sig !== '8BPS') {
    throw new Error('ESIGINVALID. File signature invalid:' + header._sig);
  } else {
    header._sig = header._sig === '8BPS';
  }
  
  header.version = bytesToNumber(bytes.slice(4, 6));
  if ((header.version !== 1 && ext === '.psd') || (header.version !== 2 && ext === '.psb')) {
    throw new Error('EFILEVERMISMATCH. File version invalid:' + header.version);
  }
  
  header._reservedBytes = bytes.slice(6, 12);
  
  header.channelsCount = bytesToNumber(bytes.slice(12, 14));
  if (header.channelsCount < 1 || header.channelsCount > 56) {
    throw new Error('ECHANNELRANGEMISMATCH. Channels count is out of range:' + header.channelsCount);
  }
  
  header.canvasHeight = bytesToNumber(bytes.slice(14, 18));
  if (header.canvasHeight < 1 && (header.canvasHeight > 30000 && ext === '.psd') || (header.canvasHeight > 300000 && ext === '.psb')) {
    throw new Error('EHEIGHTHINVALID. Canvas height is invalid:' + header.canvasHeight);
  }
  
  header.canvasWidth = bytesToNumber(bytes.slice(18, 22));
  if (header.canvasWidth < 1 && (header.canvasWidth > 30000 && ext === '.psd') || (header.canvasWidth > 300000 && ext === '.psb')) {
    throw new Error('EWIDTHINVALID. Canvas width is invalid:' + header.canvasWidth);
  }
  
  header.bitsPerChannel = bytesToNumber(bytes.slice(22, 24));
  if ([1,8,16,32].indexOf(header.bitsPerChannel) === -1) {
    throw new Error('EDEPTHINVALID. File color depth is invalid:' + header.bitsPerChannel);
  }
  
  header.colorMode = COLOR_MODES[bytesToNumber(bytes.slice(24, 26))];
  if (!header.colorMode) {
    throw new Error('ECOLORMODEINVALID. File color mode invalid:' + header.colorMode);
  }
  return header;
}

function parseColorModes (bytes) {
  const colorModes = [];
  colorModes.count = bytesToNumber(bytes.slice(0, 4));
  colorModes.data = [];
  colorModes.bytesLength = 4;
  let i = -1;
  while (++i < colorModes.count) {
    colorModes.data.push(bytes.slice(colorModes.bytesLength, colorModes.bytesLength += 768));
  }
  return colorModes;
}

function parseImages (bytes) {
  const images = [];
  console.log(bytes);
  images.count = bytesToNumber(bytes.slice(0, 4));
  
  
  
  return images;
}