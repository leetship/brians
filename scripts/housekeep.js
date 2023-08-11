const fs = require("fs");

const getFiles = (path) => {
    let files = [];
    fs.readdirSync(path)
        .sort()
        .forEach((file) => {
            if (file.startsWith(".")) {
                return;
            }
            files.push(file);
        });

    return files;
};

const getImagesWithMetadata = (path) => {
    let payload = [];
    const dirs = getFiles(path);
    for (let i = 0; i < dirs.length; i++) {
        const newPath = `${path}/${dirs[i]}`;
        const files = getFiles(newPath);
        if (files.length === 0) {
            continue;
        }

        for (let j = 0; j < files.length; j++) {
            let color = "#000000";
            let name = "1337";

            // Clean up names
            if (files[j].endsWith(".png")) {
                name = files[j].split(".png")[0];
            } else if (files[j].endsWith(".gif")) {
                name = files[j].split(".gif")[0];
            } else {
                continue;
            }
            if (/^\[#\w{6}\]/.test(name)) {
                color = name.slice(1, 8);
                name = name.slice(9);
            }

            // Encode and filter bytes size
            const encodedImage = fs.readFileSync(`${newPath}/${files[j]}`, {
                encoding: "base64",
            });
            const byteSizes = new Blob([encodedImage]).size;
            if (byteSizes > 24576) {
                console.log(dirs[i], files[j], byteSizes);
                continue;
            }
            payload.push({
                type: dirs[i],
                background: color,
                variety: name,
                image: encodedImage,
            });
        }
    }
    return payload;
};

async function main() {
    console.log("test");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
