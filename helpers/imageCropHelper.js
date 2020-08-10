const Jimp = require('jimp');
const fs = require('fs');
const { promisify } = require('util');

const writeFileAsync = promisify(fs.writeFile);

function drawLine(x, y, offset) {
  this.bitmap.data.writeUInt32BE(0x1fff5aff, offset, true);
}

module.exports = {
  async cropImageByCoordinates(coordinates, markedImage, originalPath, index) {
    const image = await Jimp.read(originalPath);

    const x = coordinates.x * image.bitmap.width;
    const y = coordinates.y * image.bitmap.height;
    let w = coordinates.w * image.bitmap.width;
    let h = coordinates.h * image.bitmap.height;

    if (y + h >= image.bitmap.height) h += -1;
    if (x + w >= image.bitmap.width) w += -1;

    markedImage.scan(x, y, w, 1, drawLine);
    markedImage.scan(x, y, 1, h, drawLine);
    markedImage.scan(x, y + h, w, 1, drawLine);
    markedImage.scan(x + w, y, 1, h, drawLine);
    image.crop(x, y, w, h);

    const fileName = `${index}.jpg`;
    await image.writeAsync(`images/${fileName}`);
    const croppedImage = await image.getBufferAsync(Jimp.MIME_JPEG);
    if (croppedImage)
      await writeFileAsync(`images/${fileName}`, croppedImage, () => {});

    return fileName;
  },
};
