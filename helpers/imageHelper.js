const Jimp = require('jimp');

const cropModelCoordinates = {
    x: 0.2166344294,
    y: 0,
    w: 0.77088305489,
    h: 0.21951219512
};

const cropSizeCoordinates = {
    x: 0.58123791102,
    y: 0.42393509127,
    w: 0.17021276595,
    h: 0.2494929006
};

const cropColorCoordinates = {
    x: 0.22823984526,
    y: 0.24746450304,
    w: 0.42263056092,
    h: 0.21095334685
}



//calculation was done manually here https://www.pictools.net/crop/
//crop from image model, color,size, brand, for very first time use site above to calculate coordinates
module.exports = {
    cropModel: async function (filePath) {
        const image = await Jimp.read(filePath);
        const imageWidth = image.bitmap.width;
        const imageHeight = image.bitmap.height;

        const xCoordinateModel = cropModelCoordinates.x * imageWidth;
        const yCoordinateModel = cropModelCoordinates.y;
        const wCoordinateModel = cropModelCoordinates.w * imageWidth;
        const hCoordinateModel = cropModelCoordinates.h * imageHeight;

        await image.crop(xCoordinateModel, yCoordinateModel, wCoordinateModel, hCoordinateModel);
        await image.writeAsync('smodel.jpg');
    },

    cropSize: async function (filePath) {
        const image = await Jimp.read(filePath);
        const imageWidth = image.bitmap.width;
        const imageHeight = image.bitmap.height;

        const xCoordinateSize = cropSizeCoordinates.x * imageWidth;
        const yCoordinateSize = cropSizeCoordinates.y * imageHeight;
        const wCoordinateSize = cropSizeCoordinates.w * imageWidth;
        const hCoordinateSize = cropSizeCoordinates.h * imageHeight

        await image.crop(xCoordinateSize, yCoordinateSize, wCoordinateSize, hCoordinateSize);
        await image.writeAsync('size.jpg');
    },

    cropColor: async function (filePath) {
        let image = await Jimp.read(filePath);
        const imageWidth = image.bitmap.width;
        const imageHeight = image.bitmap.height;

        const xCoordinateColor = cropColorCoordinates.x * imageWidth;
        const yCoordinateColor = cropColorCoordinates.y * imageHeight;
        const wCoordinateColor = cropColorCoordinates.w * imageWidth;
        const hCoordinateColor = cropColorCoordinates.h * imageHeight
        image = image.brightness(0.3);
        await image.crop(xCoordinateColor, yCoordinateColor, wCoordinateColor, hCoordinateColor);
        await image.writeAsync('scolor.jpg');
    }
}