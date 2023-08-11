const fs = require("fs");

const utils = require("./utils");

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
            let name = "1337";

            // ONLY ACCEPT PNG AND GIF
            if (files[j].endsWith(".png")) {
                name = files[j].split(".png")[0];
            } else if (files[j].endsWith(".gif")) {
                name = files[j].split(".gif")[0];
            } else {
                continue;
            }
            // GET BASE64 IMAGE DATA
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
                name: name,
                image: encodedImage,
            });
        }
    }
    return payload;
};

async function main() {
    const TRAITS_URL = "https://1337py.vercel.app/brian/traits";
    const fixed = JSON.parse(fs.readFileSync("./assets/critters_fixed.json"));
    const snapshot = JSON.parse(
        fs.readFileSync("./assets/critters_snapshot.json")
    );

    let distribution = {};
    for (let i = 0; i < snapshot.length; i++) {
        distribution[snapshot[i].name] = snapshot[i].rarity;
    }
    for (let i = 0; i < fixed.length; i++) {
        await utils.delay(100);
        if (!fixed[i].name in distribution) {
            console.log("no", fixed[i].name);
        } else {
            payload = {
                img_data: `data:image/png;base64,${fixed[i].image}`,
                name: fixed[i].name,
                rarity: distribution[fixed[i].name],
                type: "special",
                subtype: "critter",
            };
            if (payload.rarity === undefined) {
                payload.rarity = 0;
            }
            console.log(payload);

            // const resp = await fetch(TRAITS_URL, {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify(payload),
            // });
            // const data = await resp.json();
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
