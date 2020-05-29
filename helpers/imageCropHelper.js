const Jimp = require('jimp');

//calculation was done manually here https://www.pictools.net/crop/
//crop from image model, color,size, brand, for very first time use site above to calculate coordinates
module.exports = {
    cropModel: async function (filePath, coordinates) {
        const image = await Jimp.read(filePath);
        const imageWidth = image.bitmap.width;
        const imageHeight = image.bitmap.height;

        const xCoordinateModel = coordinates.x * imageWidth;
        const yCoordinateModel = coordinates.y * imageHeight;
        const wCoordinateModel = coordinates.width * imageWidth;
        const hCoordinateModel = coordinates.height * imageHeight;
        await image.crop(xCoordinateModel, yCoordinateModel, wCoordinateModel, hCoordinateModel);
        await image.writeAsync('public/uploads/smodel.jpg');
    },

    cropSize: async function (filePath, coordinates) {
        let image = await Jimp.read(filePath);
        const imageWidth = image.bitmap.width;
        const imageHeight = image.bitmap.height;

        const xCoordinateSize = coordinates.x * imageWidth;
        const yCoordinateSize = coordinates.y * imageHeight;
        const wCoordinateSize = coordinates.width * imageWidth;
        const hCoordinateSize = coordinates.height * imageHeight
        image = image.brightness(0.3);
        await image.crop(xCoordinateSize, yCoordinateSize, wCoordinateSize, hCoordinateSize);
        await image.writeAsync('public/uploads/size.jpg');
    },

    cropColor: async function (filePath, coordinates) {
        let image = await Jimp.read(filePath);
        const imageWidth = image.bitmap.width;
        const imageHeight = image.bitmap.height;

        const xCoordinateColor = coordinates.x * imageWidth;
        const yCoordinateColor = coordinates.y * imageHeight;
        const wCoordinateColor = coordinates.width * imageWidth;
        const hCoordinateColor = coordinates.height * imageHeight
        image = image.brightness(0.3);
        await image.crop(xCoordinateColor, yCoordinateColor, wCoordinateColor, hCoordinateColor);
        await image.writeAsync('public/uploads/scolor.jpg');
    }
}