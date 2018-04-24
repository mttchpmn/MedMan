#! /usr/bin/env node

// File system operations
const fs = require('fs');
// CLI argument parsing
const program = require('commander');

// Object to encapsulate MedMan functionality
const MedMan = {

    // Object encapsulating 'rename' funcitonality
    rename: {

        // Bools to determine program functionality
        isPreview: false,
        isRecursive: false,

        // Get array of all files in folder and return info as object
        getInfo(seriesName, dir,  callback) {
            const filesArray = fs.readdirSync(dir);

            callback(null, {
                dir: dir,
                files: filesArray,
                seriesName: seriesName
            });
        },

        // Check if path is dir
        isDirectory(fname, cwd) {
            return fs.lstatSync(`${cwd}/${fname}`).isDirectory();
        },

        // Check if file is valid media to be renamed
        isMedia(fname) {
            const validExtensions = [
                "avi",
                "mp4",
                "mkv",
                "mpg"
            ];
            let extension = fname.slice(-3);

            return validExtensions.includes(extension);
        },
        
        // Use regEx to find identifier (Season and Episode) in filename
        getIdentifier(fname, cb) {

            // Find '3x04' style identifiers
            let identA = fname.match(/\d{1}x\d{2}/gi) || undefined;
            if (identA) {
                // Mutate identifier to 'S03E04' format
                let nums = identA[0].toUpperCase().split('X');
                let id = `S0${nums[0]}E${nums[1]}`;
                return cb(null, id);
            }

            // Find 's03e04' style identifiers
            let identB = fname.match(/s\d{2}e\d{2}/gi) || undefined;
            if (identB) {
                let id = identB[0].toUpperCase();
                return cb(null, id);
            }

            cb(`${fname.padEnd(40, ' ')}  =======>  ${'NO ID - SKIPPED'.padStart(40, ' ')}`);
        },

        // Check if file is media and rename it if so
        parseFile(fname, infoObject, cb) {
            if (this.isMedia(fname)) {
                this.getIdentifier(fname, (err, res) => {

                    // Will error if no identifier is found
                    if (err) {
                        console.error(err);
                        return cb(null);
                    }

                    // Generate new name in line with Plex format
                    let newName = `${infoObject.seriesName} - ${res}${fname.slice(-4)}`;

                    // Do the rename if '--preview' flag is not present
                    if (!this.isPreview) fs.renameSync(`${infoObject.dir}/${fname}`, `${infoObject.dir}/${newName}`);

                    // Callback with the transformation info
                    cb(null, `${fname.padEnd(50, ' ')}  =======>  ${newName.padStart(50, ' ')}`);
                });
            }
        },

        parseDirectory(infoObject, callback) {

            // Parse each file in the array of files from the current directory
            for (let fname of infoObject.files) {
                this.parseFile(fname, infoObject, (err, res) => {
                    // Log the transformed file info
                    console.log(res);
                });
            }
        },

        renameDirectory(seriesName, path) {

            console.log(`\nRenaming files in ${path}`);
            this.getInfo(seriesName, path, (err, res) => {
                if (err) {
                    console.error(err);
                }
                this.parseDirectory(res);
            });
        },

        run(seriesName) {

            // Directory that command is invoked in
            const topDir = process.cwd();

            // Rename the files in current directory no matter what
            this.renameDirectory(seriesName, topDir);

            // Rename the files in folders 1 level down if '--recursive' flag is present
            // TODO - Make this properly recursive  - more than 1 level down
            if (this.isRecursive) {
                for (const path of fs.readdirSync(topDir)) {
                    if (this.isDirectory(path, topDir)) {
                        this.renameDirectory(seriesName, `${topDir}/${path}`);
                    }
                }
            }
        },
    }
};

const Main = {
    rename: (seriesName, cmd) => {

        // Set config Bools
        MedMan.rename.isPreview = cmd.preview;
        MedMan.rename.isRecursive = cmd.recursive;
        // Do the work
        MedMan.rename.run(seriesName);
    }
};

program
    .command('rename <seriesName>')
    .option('-r, --recursive', 'Rename recursively')
    .option('-p, --preview', 'Preview renaming without changing files')
    .description('Tidies up filenames of episodes in current working directory')
    .action(Main.rename);

program.parse(process.argv);

module.exports = MedMan;