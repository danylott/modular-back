require('dotenv').config();

const amqp = require('amqplib');
const NodeWebcam = require( "node-webcam" );
const Dynamsoft = require('dynamsoft-node-barcode');

const { Session } = require('../models/session');
const { Class } = require('../models/class');
const { Recognition } = require('../models/recognition');
const { recognizeFullSingleImage } = require('./recognizeFullSingleImage')

Dynamsoft.BarcodeReader.productKeys = process.env.DYNAMSOFT_PRODUCT_KEY;

let channel;
let reader;

const init = async (amqpUrl) => {
  const cluster = await amqp.connect(amqpUrl);
  channel = await cluster.createChannel();
  reader = await Dynamsoft.BarcodeReader.createInstance();
};

const close = () => {
  // channel.close()
};

const webcamOptions = {

  //Picture related

  width: 2880,

  height: 1620,

  quality: 90,

  // Number of frames to capture
  // More the frames, longer it takes to capture
  // Use higher framerate for quality. Ex: 60

  frames: 1,

  delay: 0,


  //Save shots in memory

  saveShots: true,


  // [jpeg, png] support varies
  // Webcam.OutputTypes

  output: "jpeg",


  //Which camera to use
  //Use Webcam.list() for results
  //false for default device

  device: false,


  // [location, buffer, base64]
  // Webcam.CallbackReturnTypes

  callbackReturn: "buffer",


  //Logging

  verbose: false

};

const Webcam = NodeWebcam.create( webcamOptions );

const publish = async (queue, message) => {
  try {
    await channel.assertQueue(queue, { durable: true });
    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

    console.info('RabbitMQ: Message sent to', queue);
  } catch (error) {
    console.error(error, 'RabbitMQ: Unable to connect to cluster');
  }
};
const consume = async (queue, callback) => {
  try {
    await channel.assertQueue(queue, { durable: true });
    channel.consume(queue, function(message) {
      if (message) {
        callback(JSON.parse(message.content.toString()));
        channel.ack(message);
      }
    });
  } catch (error) {
    console.error(error, 'RabbitMQ: Unable to connect to cluster');
  }
};

const startAll = () => {
  consume('session_start', async (message) => {
    const classes = await Class.find({ make: message.brands });
    message.classes = classes.map((el) => el.name);

    const session = await Session.create(message);
    console.log(
      `RabbitMQ: New session created at position ${session.positionId} from supplier ${session.supplier}`
    );
  });

  consume('session_end', async ({ positionId }) => {
    await Session.updateMany(
      { positionId },
      { $set: { inProgress: false, updatedAt: Date.now() } }
    );
    console.log(`RabbitMQ: Session closed at position ${positionId}`);
  });

  consume(
    'recognition_feedback',
    async ({ recognitionId, brand, color, size, model }) => {
      try {
        const recognition = await Recognition.findById(recognitionId);
        recognition.response = { brand, color, size, model: model.name };
        recognition.updatedAt = Date.now();
        await recognition.save();
        console.log(`RabbitMQ: Receive feedback for ${recognitionId}`);
      } catch (error) {
        console.error(
          `RabbitMQ: Receive feedback for ${recognitionId} but it was not found in DB`
        );
      }
    }
  );

  consume(
    'take_snapshot',
    async({ positionId }) => {
      try {
        console.log(`RabbitMQ: Receive "Take Snapshot" for ${positionId}`);
        Webcam.capture( "images/input", function( err, data ) {
          if (err) {
            console.log(err);
            return;
          }
          console.log(data);
          recognizeFullSingleImage(data, positionId, reader)
            .then(recognitionData => {
              publish('recognitions', recognitionData);
            })
            .catch(err => console.log(err));
        });
      } catch (error) {
        console.error(
          `RabbitMQ: Receive "Take Snapshot" event, but can't handle it: ${error}`
        );
      }
    }
  );

  // publish("take_snapshot", {
  //   positionId: 2,
  // })
  // publish("session_start", {
  //   positionId: 2,
  //   supplier: "ADIDAS ESPAÑA, S.A.U.",
  //   brands: ["ADIDAS", "REEBOK", "ROCKPORT"],
  // })
  // publish("session_end", { positionId: 2 })
  // publish("recognition_feedback", {
  //   recognitionId: "5f057a05f6580a1733dea2be",
  //   brand: "W.A.U",
  //   model: {
  //     reference: "103553",
  //     name: "BOHO",
  //     supplirReference: "WS96111",
  //   },
  //   color: "VERDE",
  //   size: "36",
  // })
};

module.exports = { init, close, startAll, publish };
