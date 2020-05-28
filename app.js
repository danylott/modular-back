const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const app = express();
const path = require('path');
const barDecoder = require('node-zbardecoder');

const mongoose = require('mongoose');

const {awsApiRecognition, sizeRecognition, colorRecognition, modelRecognition} = require("./helpers/recognize");
const {cropModel, cropSize, cropColor} = require("./helpers/imageHelper");
const {curlGetByBarCode, curlPostWithParams} = require("./helpers/curlWrapper");

//rabbitMq
const pushToQueue = require('./helpers/rabbitMqPublish');

//stream of files, so every next will overwrite previous, to avoid mess
const fileNameForPresentation = '11112222233334444555666777';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'public/uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
            console.log("Folder created, first request");
        }

        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // const fileName = Date.now() + '-' + file.originalname;
        const fileName = fileNameForPresentation + path.extname(file.originalname);
        cb(null, fileName)
    }
});
const upload = multer({storage: storage});

app.use(morgan('combined', {
    skip: function (req, res) {
        return res.statusCode < 400
    }
}));
app.use(helmet());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/testdb", {
    useNewUrlParser: "true",
    useUnifiedTopology: true
})
mongoose.connection.on("error", err => {
    console.log("err", err)
})
mongoose.connection.on("connected", (err, res) => {
    console.log("mongoose is connected")
})

const RecognizeModel = mongoose.model("recognize", {
    name: String,
    model_coordinate: Object,
    color_coordinate: Object,
    size_coordinate: Object,
    brand_coordinate: Object
});

app.post("/person", async (req, res) => {
    try {
        const recognize = new RecognizeModel(req.body);
        const result = await recognize.save();
        res.send(result);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/recognize', function (req, res) {
    let model, color, size, mark, imageSrc, scannedData;

    typeof globalDataByApiRequest !== 'undefined' ? model = globalDataByApiRequest.modelName : undefined;
    typeof globalDataByApiRequest !== 'undefined' ? color = globalDataByApiRequest.color.name : undefined;
    typeof globalDataByApiRequest !== 'undefined' ? size = globalDataByApiRequest.size.number : undefined;
    typeof globalDataByApiRequest !== 'undefined' ? mark = globalDataByApiRequest.brand.name : undefined;
    // typeof globalDataByApiRequest !== 'undefined' ? imageSrc = globalDataByApiRequest.localImgSrc : undefined;
    typeof globalScannedDataFromImage !== 'undefined' ? imageSrc = globalScannedDataFromImage.imageSrc : undefined;
    typeof globalScannedDataFromImage !== 'undefined' ? scannedData = globalScannedDataFromImage : undefined;
    delete global.globalDataByApiRequest;
    delete global.globalScannedDataFromImage;

    res.render('recognize.ejs', {
        model: model,
        color: color,
        size: size,
        mark: mark,
        imageSrc: imageSrc,
        scannedData: scannedData
    });
});

app.get('/', function (req, res) {

    res.sendFile(path.join(__dirname, './views/welcome.html'));
});

app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        res.status(404).send({
            success: false,
            message: "File wasn't sent"
        });
        return;
    }

    //classes = ['krack', 'nike', 'skechers', 'victoria']
    const imageClass = req.body.class;

    await cropModel(req.file.path);
    await cropSize(req.file.path);
    await cropColor(req.file.path);

    const bitmap1 = fs.readFileSync('public/uploads/scolor.jpg');
    const bitmap2 = fs.readFileSync('public/uploads/size.jpg');
    const bitmap3 = fs.readFileSync('public/uploads/smodel.jpg');

    let textFromCroppedImage = [];

    await Promise.all([await awsApiRecognition(bitmap1), await awsApiRecognition(bitmap2), await awsApiRecognition(bitmap3)]).then(values => {
        for (let index of values) {
            textFromCroppedImage.push(index)
        }
    });

    let color = await colorRecognition(textFromCroppedImage[0]);
    let size = await sizeRecognition(textFromCroppedImage[1]);
    let model = await modelRecognition(textFromCroppedImage[2]);

    global.globalScannedDataFromImage = {
        'color': color,
        'size': size,
        'model': model,
        'brand': imageClass.capitalize(),
        "imageSrc": req.file.filename
    };

    res.status(200).send({
        success: true,
        size: size,
        model: model,
        color: color,
        brand: imageClass.capitalize()
    });
});


app.listen(3000, () => console.log('Server started on port 3000'));


// const barCodeImage = req.file.path;

//detect if image/photo has a barcode
// const result = JSON.parse(barDecoder.decode(barCodeImage));
//
// const bitmap = fs.readFileSync(req.file.path);
// const data = await awsApiRecognition(bitmap);

// //file to base 64 to send string with rabbitMq
// data.imageAsBase64 = fs.readFileSync(req.file.path, 'base64');
//
// //if image has no barcode
// if (result.results.length === 0) {
//
//     const postCurl = await curlPostWithParams(data);
//
//     //if post request comes without server error but still has no data to return
//     if (postCurl.statusCode === 404 && postCurl.code === 404) {
//         res.status(404).send({
//             success: false,
//             message: "KRACK API {POST} REQUEST COMES WITHOUT DATA."
//         });
//         return;
//     }
//     postCurl.data.localImgSrc = req.file.filename;
//
//     //this data comes from an API KRACK
//     global.globalDataByApiRequest = postCurl.data;
//     //this data comes from image via AS recognition api
//     global.globalScannedDataFromImage = data;
//
//     res.status(200).send({
//         success: true,
//         data: postCurl
//     });
//     return;
// }
//
// //get request to an api with barcode detected
// const curlGet = await curlGetByBarCode(result.results[0].data);
//
// if (curlGet.statusCode === 404 && curlGet.code === 404) {
//     res.status(404).send({
//         success: false,
//         message: "KRACK API {GET} REQUEST COMES WITHOUT DATA."
//     });
//     return;
// }
//
// curlGet.data.localImgSrc = req.file.filename;
//
// //this data comes from an API KRACK
// global.globalDataByApiRequest = curlGet.data;
// //this data comes from image via AS recognition api
// global.globalScannedDataFromImage = data;
//
// await pushToQueue('task_queue', JSON.stringify(globalScannedDataFromImage));