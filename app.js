const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const app = express();

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
        const fileName = Date.now() + '-' + file.originalname;
        global.globalFileName = fileName;
        cb(null, fileName)
    }
});

const upload = multer({storage: storage});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//ROUTES WILL GO HERE
app.get('/recognize', function (req, res) {
    let imageSrc;
    let val1, val2, val3, val4, val5;
    typeof globalFileName !== 'undefined' ? imageSrc = globalFileName : undefined;
    typeof globalVal1 !== 'undefined' ? val1 = globalVal1 : undefined;
    typeof globalVal2 !== 'undefined' ? val2 = globalVal2 : undefined;
    typeof globalVal3 !== 'undefined' ? val3 = globalVal3 : undefined;
    typeof globalVal4 !== 'undefined' ? val4 = globalVal4 : undefined;
    typeof globalVal5 !== 'undefined' ? val5 = globalVal5 : undefined;

    delete global.globalFileName;
    delete global.globalVal1;
    delete global.globalVal2;
    delete global.globalVal3;
    delete global.globalVal4;
    delete global.globalVal5;

    res.render('index', {image: imageSrc, val1: val1, val2: val2, val3: val3, val4: val4, val5: val5})

});

app.get('/', function (req, res) {

    res.render('welcome');
});

app.post('/upload', upload.single('image'), (req, res, next) => {
    global.globalVal1 = req.body.val1;
    global.globalVal2 = req.body.val2;
    global.globalVal3 = req.body.val3;
    global.globalVal4 = req.body.val4;
    global.globalVal5 = req.body.val5;


    if (!req.file.originalname) {
        throw new Error('Please upload a file');
    }

    res.status(200).send({ success: true});
});

app.listen(3000, () => console.log('Server started on port 3000'));
