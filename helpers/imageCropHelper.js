const Jimp = require("jimp")

function drawLine(x, y, offset) {
  this.bitmap.data.writeUInt32BE(0x1fff5aff, offset, true)
}

module.exports = {
  cropImageByCoordinates: async function (coordinates, markedImage, originalPath) {
    const image = await Jimp.read(originalPath)

    const x = coordinates.x * image.bitmap.width
    const y = coordinates.y * image.bitmap.height
    let w = coordinates.w * image.bitmap.width
    let h = coordinates.h * image.bitmap.height

    if (y + h >= image.bitmap.height) h--
    if (x + w >= image.bitmap.width) w--

    markedImage.scan(x, y, w, 1, drawLine)
    markedImage.scan(x, y, 1, h, drawLine)
    markedImage.scan(x, y + h, w, 1, drawLine)
    markedImage.scan(x + w, y, 1, h, drawLine)
    image.crop(x, y, w, h)
    //image.write(`./images/${coordinates.field}.jpg`)
    return await image.getBufferAsync(Jimp.MIME_JPEG)
  },
}
