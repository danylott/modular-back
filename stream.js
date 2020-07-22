const fs = require('fs');
const { promisify } = require('util');
const mongoose = require('mongoose');
const { argv } = require('yargs');
const Dynamsoft = require('dynamsoft-node-barcode');
const { processImage } = require('./helpers/recognize');
const rabbitMq = require('./helpers/rabbitMq');
const { Recognition } = require('./models/recognition');
const { Session } = require('./models/session');

Dynamsoft.BarcodeReader.productKeys = process.env.DYNAMSOFT_PRODUCT_KEY;

const writeFileAsync = promisify(fs.writeFile);

function sleep(s) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000));
}

let busy = false;
let reader;

async function handleSingleImage(buffer) {
  busy = true;

  const positionId = argv.position;
  console.info(`start processing frame for position ${positionId}`);

  // if (buffer) {
  //   const barcodes = await reader.decode(buffer);
  //   if (barcodes.length > 0) {
  //     console.log(
  //       `${barcodes[0].barcodeFormatString} found: ${barcodes[0].barcodeText}`
  //     );
  //
  //     const { _id: recognitionId, barcode } = await Recognition.create({
  //       positionId,
  //       barcode: barcodes[0].barcodeText,
  //       barcodeType: barcodes[0].barcodeFormatString,
  //     });
  //     rabbitMq.publish('recognitions', {
  //       positionId,
  //       recognitionId,
  //       barcode,
  //     });
  //
  //     await sleep(10);
  //     busy = false;
  //     return;
  //   }
  // }

  if (buffer) await writeFileAsync('images/input.jpg', buffer, () => {});

  const session = await Session.findOne({ positionId, inProgress: true });
  if (session) console.log('session found, looking for', session.classes);

  const res = await processImage({
    filterClasses: session ? session.classes : null,
  });

  if (!!res.found && !!res.class) {
    const recognition = await Recognition.create({
      positionId,
      classId: res.class._id,
      score: res.score,
      recognized: { model: res.model, size: res.size, color: res.color },
    });
    rabbitMq.publish('recognitions', {
      positionId,
      recognitionId: recognition._id,
      barcode: null,
      barcodeType: null,
      image: buffer ? buffer.toString('base64') : null,
      brand: res.class.make,
      model: res.model,
      size: res.size,
      color: res.color,
    });
  }

  await sleep(0.2);
  busy = false;
}

mongoose
  .connect(`mongodb://localhost:27017/${process.env.MONGO_DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    await rabbitMq.init(process.env.RABBIT_MQ_URL);
    reader = await Dynamsoft.BarcodeReader.createInstance();

    if (argv.test) {
      await handleSingleImage(null);
      mongoose.connection.close();
      rabbitMq.close();
      reader.destroy();
    } else {
      process.stdin.on('data', (buffer) => {
        if (!busy) handleSingleImage(buffer);
      });
    }
  });
