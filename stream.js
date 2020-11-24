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

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

let busy = false;
let reader;

// eslint-disable-next-line complexity
async function handleSingleImage(buffer) {
  try {
    busy = true;

    const positionId = argv.position;
    console.info(`start processing frame for position ${positionId}`);

    if (buffer) {
      const barcodes = await reader.decode(buffer);
      if (barcodes.length > 0) {
        console.log(
          `${barcodes[0].barcodeFormatString} found: ${barcodes[0].barcodeText}`
        );

        const { _id: recognitionId, barcode } = await Recognition.create({
          positionId,
          barcode: barcodes[0].barcodeText,
          barcodeType: barcodes[0].barcodeFormatString,
        });
        rabbitMq.publish('recognitions', {
          positionId,
          recognitionId,
          barcode,
          image: buffer ? buffer.toString('base64') : null,
        });

        await sleep(10);
        busy = false;
        return;
      }
    }

    if (buffer) await writeFileAsync('images/input.jpg', buffer, () => {});

    const session = await Session.findOne({ positionId, inProgress: true });
    if (session) console.log('session found, looking for', session.classes);

    const res = await processImage({
      filterClasses: session ? session.classes : null,
    });

    if (!!res.found && !!res.class) {
      const previousRecognition = await Recognition.findOne({positionId}, {}, { sort: {'createdAt': -1}});
      const recognition = await Recognition.create({
        positionId,
        classId: res.class._id,
        score: res.score,
        recognized: { model: res.model, size: res.size, color: res.color },
      });
      let totalSimilatiry = 0;
      if(!!previousRecognition) {
        if (Object.keys(previousRecognition.recognized).length > 0) {
          previousRecognition.recognized.size && (totalSimilatiry += similarity(previousRecognition.recognized.size, recognition.recognized.size));
          previousRecognition.recognized.model && (totalSimilatiry += similarity(previousRecognition.recognized.model, recognition.recognized.model));
          previousRecognition.recognized.color && (totalSimilatiry += similarity(previousRecognition.recognized.color, recognition.recognized.color));
          totalSimilatiry /= 3;
          console.log("totalSimilarity: ", totalSimilatiry);
        }
      }
      if (totalSimilatiry <= 0.95) {
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
    }

    await sleep(0.2);
    busy = false;
  } catch (e) {
    console.error(e);
  }
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
