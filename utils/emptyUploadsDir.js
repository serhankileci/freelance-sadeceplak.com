async function emptyUploadsDir() {
    const { UPLOADS_DIR } = require("../config/config");
    const fsPromises = require("fs").promises;
    try {
        const files = await fsPromises.readdir(UPLOADS_DIR);
        
        for (const file of files) {
            const theFile = await fsPromises.stat(`${UPLOADS_DIR}/${file}`);
            if (theFile.isFile()) fsPromises.rm(`${UPLOADS_DIR}/${file}`, { recursive: true, force: true });
        }
    } catch(err) { throw err; }
}

module.exports = {
    emptyUploadsDir
}