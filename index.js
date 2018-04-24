#! /usr/bin/env node

// Imports
const fs = require('fs');
const program = require('commander');

const MedMan = {
    rename: {
        isPreview: false,
        isRecursive: false,

        getInfo(seriesName, dir,  callback) {
            const filesArray = fs.readdirSync(dir);

            callback(null, {
                dir: dir,
                files: filesArray,
                seriesName: seriesName
            });
        },

        isDirectory(fname, cwd) {
            return fs.lstatSync(`${cwd}/${fname}`).isDirectory();
        },

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
        
        getIdentifier(fname, cb) {
            let altID = fname.match(/\d{1}x\d{2}/gi) || undefined;

            if (altID) {
                let nums = altID[0].toUpperCase().split('X');
                let id = `S0${nums[0]}E${nums[1]}`;
                return cb(null, id);
            }

            let re = /s\d{2}e\d{2}/gi;
            let arr = fname.match(re);
            let ident = arr[0].toUpperCase();

            cb(null, ident);
        },

        parseFile(fname, seriesName, cb) {
            if (this.isMedia(fname)) {
                this.getIdentifier(fname, (err, res) => {
                    let newName = `${seriesName} - ${res}${fname.slice(-4)}`;
                    if (!this.isPreview) fs.renameSync(fname, newName);
                    console.log(`${fname.padEnd(40, ' ')}  =======>  ${newName.padStart(40, ' ')}`);
                    cb(null);
                });
            }
        },

        parseDirectory(infoObject, callback) {
            for (let fname of infoObject.files) {
                this.parseFile(fname, infoObject.seriesName, (err, res) => {
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

            const topDir = process.cwd();

            this.renameDirectory(seriesName, topDir);

            if (this.isRecursive) {
                for (const path of fs.readdirSync(topDir)) {
                    if (this.isDirectory(path, topDir)) {
                        this.renameDirectory(seriesName, path);
                    }
                }
            }
        },
    }
};

const Main = {
    rename: (seriesName, cmd) => {
        MedMan.rename.isPreview = cmd.preview;
        MedMan.rename.isRecursive = cmd.recursive;
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