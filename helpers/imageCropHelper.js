const Jimp = require('jimp');

async function cropImageByCoordinates(coordinates, filePath, saveImageName) {
    let image = await Jimp.read(filePath);

    const xCoordinate = coordinates.x * image.bitmap.width;
    const yCoordinate = coordinates.y * image.bitmap.height;
    const wCoordinate = coordinates.width * image.bitmap.width;
    const hCoordinate = coordinates.height * image.bitmap.height;

    image = image.brightness(0.3);
    await image.crop(xCoordinate, yCoordinate, wCoordinate, hCoordinate);
    await image.writeAsync(`public/uploads/${saveImageName}.jpg`);
}

//calculation was done manually here https://www.pictools.net/crop/
//crop from image model, color,size, brand, for very first time use site above to calculate coordinates
module.exports = {
    cropModel: async function (filePath, coordinates) {
        await cropImageByCoordinates(coordinates, filePath, 'smodel');
    },

    cropSize: async function (filePath, coordinates) {
        await cropImageByCoordinates(coordinates, filePath, 'size');
    },

    cropColor: async function (filePath, coordinates) {
        await cropImageByCoordinates(coordinates, filePath, 'scolor');
    }
}