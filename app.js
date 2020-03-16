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
app.get('/', function (req, res) {
    let imageSrc;
    let name;
    let size;

    if (typeof globalFileName !== 'undefined') {
        imageSrc = globalFileName;
    }

    if (typeof globalSize !== 'undefined' && globalSize) {
        size = globalSize;
    }

    if (typeof globalName !== 'undefined' && globalName) {
        name = globalName;
    }

    delete global.globalFileName;
    delete global.globalName;
    delete global.globalSize;
    res.render('index', {image: imageSrc, name:name, size:size})

});

app.get('/welcome', function (req, res) {

    res.render('welcome');
});

app.post('/upload', upload.single('image'), (req, res, next) => {
    const file = req.file.originalname;
    global.globalSize = req.body.size;
    global.globalName = req.body.name;

    if (!file) {
        const error = new Error('Please upload a file');
        error.httpStatusCode = 400;
        return next(error)
    }

    res.json({success: true})
});

app.listen(3000, () => console.log('Server started on port 3000'));