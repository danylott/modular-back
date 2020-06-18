const Jimp = require("jimp")

function drawLine(x, y, offset) {
  this.bitmap.data.writeUInt32BE(0x1fff5aff, offset, true)
}

module.exports = {
  cropImageByCoordinates: async function (coordinates, markedImage, originalPath) {
    const image = await Jimp.read(originalPath)
    const x = coordinates.x * image.bitmap.width
    const y = coordinates.y * image.bitmap.height
    const w = coordinates.w * image.bitmap.width
    const h = coordinates.h * image.bitmap.height

    markedImage.scan(x, y, w, 1, drawLine)
    markedImage.scan(x, y, 1, h, drawLine)
    markedImage.scan(x, y + h, w, 1, drawLine)
    markedImage.scan(x + w, y, 1, h, drawLine)
    //image = image.brightness(0.3);
    image.crop(x, y, w, h)
    return await image.getBufferAsync(Jimp.MIME_JPEG)
  },
}
