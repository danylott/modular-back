require('dotenv').config();
const { processImage } = require('./recognize');
const { Recognition } = require('../models/recognition');
const { Session } = require('../models/session');
const { getCorrectCode128 } = require('./checkCode128')


function analyzeBarcodes(barcodes) {
  const code128Barcodes = barcodes.filter(barcode => barcode.barcodeFormatString === 'CODE_128');
  if(code128Barcodes.length === 0) {
    return barcodes[0]
  }

  let code128 = getCorrectCode128(code128Barcodes);
  if(code128) {
    return code128;
  }
  if(code128Barcodes.length === barcodes.length) {
    return null;
  }
  return barcodes.filter(barcode => barcode.barcodeFormatString !== 'CODE_128')[0];
}


async function recognizeFullSingleImage(buffer, positionId, reader) {
  try {
    console.info(`start processing frame for position ${positionId}`);
    if (buffer) {
      const barcodes = await reader.decode(buffer);
      if (barcodes.length > 0) {
        let targetBarcode = analyzeBarcodes(barcodes);
        if(targetBarcode) {
          console.log(
            `${targetBarcode.barcodeFormatString} found: ${targetBarcode.barcodeText}`
          );


          const { _id: recognitionId, barcode } = await Recognition.create({
            positionId,
            barcode: targetBarcode.barcodeText,
            barcodeType: targetBarcode.barcodeFormatString,
          });
          return {
            positionId,
            recognitionId,
            barcode,
            image: buffer ? buffer.toString('base64') : null,
          };
        }
      }
    }

    const session = await Session.findOne({ positionId, inProgress: true });
    if (session) console.log('session found, looking for', session.classes);

    const res = await processImage({
      filterClasses: session ? session.classes : null,
    });

    if (!!res.found && !!res.class) {
      const previousRecognition = await Recognition.findOne(
        { positionId },
        {},
        { sort: { createdAt: -1 } }
      );
      const recognition = await Recognition.create({
        positionId,
        classId: res.class._id,
        score: res.score,
        recognized: { model: res.model, size: res.size, color: res.color },
      });
      // let totalSimilarity = getTotalSimilarity(recognition, previousRecognition);
      // if (totalSimilarity <= 0.95) {
      return {
        positionId,
        recognitionId: recognition._id,
        barcode: null,
        barcodeType: null,
        image: buffer ? buffer.toString('base64') : null,
        brand: res.class.make,
        model: res.model,
        size: res.size,
        color: res.color,
      };
      // }
    }
  } catch (e) {
    console.error(e);
  }
  return {
    positionId,
    recognitionId: null,
    barcode: null,
    image: buffer ? buffer.toString('base64') : null,
  };
}

module.exports = { recognizeFullSingleImage }