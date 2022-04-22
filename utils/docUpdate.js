async function updObj(mediaObj, basePath, mediaType) {
    try {
        for (const media of mediaObj) {
            media.destination = `${basePath}/${mediaType}`;
            media.filename = media.originalname;
            media.path = `${basePath}/${mediaType}/${media.originalname}`;
        }
    } catch(err) { throw err; }
}

module.exports = {
    updObj
}