module.exports = {
    markRecognition: function (detectedWord) {
        //matching on two word or colon, only mark has colon on this pic
        if (detectedWord.toLowerCase().includes("msrca") || detectedWord.toLowerCase().includes("macs") || detectedWord.toLowerCase().includes(":")) {
            detectedWord = detectedWord.split(":");
            if (detectedWord[1].includes("1)")) {
                detectedWord[1] = detectedWord[1].replace("1)", "");
            }

            if (detectedWord[1].includes("0)")){
                detectedWord[1] = detectedWord[1].replace("0)", "");
            }
            return detectedWord[1].trim();
        }
    },

    modelRecognition: function (detectedWord) {
        if (detectedWord.includes("S.L.") || detectedWord.includes(" SL")) {
            if (detectedWord.includes(" 1)")) {
                detectedWord = detectedWord.replace("1)", "");
            }
            return detectedWord.trim();
        }
    },

    colorRecognition: function (detectedWord) {
        if (detectedWord.toLowerCase() === "negro") {
            return detectedWord;
        }
    },

    sizeRecognition: function (detectedWord) {
        if (/^\s*([234][0-9])\s*$/.test(detectedWord)) {
            return detectedWord;
        }
    },
};


// модель - 833 XI FOOTWEAR, S.L.
// марка - XTI 118
// цвет - NEGRO
// размер - 37

// модель  /([0-9+][\sA-Z,.]+)\n/i.exec(firstLineItems.join(' '))
// марка /M[as]rca:([\sA-Z,.0-9$]+)/i.exec(secondLineItems.join(' '))
// колір /^\s*(NERGRO)\s*$/i
// розмір /^\s*([234][0-9])\s*$/