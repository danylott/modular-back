const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const app = express();
const path = require('path');
const request = require("request");
//AWS
require('dotenv').config();

const AWS = require('aws-sdk');
AWS.config.region = "us-east-1";
const rekognition = new AWS.Rekognition({region: "us-east-1"});

const {markRecognition, modelRecognition, colorRecognition, sizeRecognition} = require("./helpers/recognize");

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

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.get('/recognize', function (req, res) {
    let model, color, size, mark, imageSrc;
    typeof globalModel !== 'undefined' ? model = globalModel : undefined;
    typeof globalColor !== 'undefined' ? color = globalColor : undefined;
    typeof glocalSize !== 'undefined' ? size = glocalSize : undefined;
    typeof globalMark !== 'undefined' ? mark = globalMark : undefined;
    typeof globalImageSrc !== 'undefined' ? imageSrc = globalImageSrc : undefined;

    delete global.globalModel;
    delete global.globalColor;
    delete global.glocalSize;
    delete global.globalMark;
    delete global.globalImageSrc;

    res.render('recognize.ejs', {model: model, color: color, size: size, mark: mark, imageSrc: imageSrc});
});

app.get('/', function (req, res) {

    res.sendFile(path.join(__dirname, './views/welcome.html'));
});

app.post('/barcode', upload.single('image'), (req, res) => {
    const barDecoder = require('node-zbardecoder');
    if (!req.file) {
        throw new Error("File wasn't sent");
    }

    const barCodeImage = req.file.path;
    const result = JSON.parse(barDecoder.decode(barCodeImage));
    console.log(result);

    request(`http://conexion1.globalretail.es:57354/api/recognition/ean/${result.results[0].data}`, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            body = JSON.parse(body);
            global.barCodeDate = body;
            res.status(200).send({
                success: true,
                data: body.data
            });
        }
    });
});

app.post('/upload', upload.single('image'), (req, res, next) => {
    let bitmap = fs.readFileSync(req.file.path);
    let model;
    let color;
    let size;
    let mark;

    rekognition.detectText({
        "Image": {
            "Bytes": bitmap,
        }
    }, async function (err, data) {

        if (err) {
            console.log(err)
        }
        for (let words of data.TextDetections) {
            model = model ? model : modelRecognition(words.DetectedText);
            color = color ? color : colorRecognition(words.DetectedText);
            size = size ? size : sizeRecognition(words.DetectedText);
            mark = mark ? mark : markRecognition(words.DetectedText);
        }

        if (model && color && size && mark) {
            global.globalModel = model;
            global.globalColor = color;
            global.glocalSize = size;
            global.globalMark = mark;
            global.globalImageSrc = req.file.filename;
        }

        res.status(200).send({
            success: true, data: {model, color, size, mark}
        });
    });
});


app.listen(3000, () => console.log('Server started on port 3000'));
