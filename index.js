#! /usr/bin/env node

// Imports
const fs = require('fs');
const program = require('commander');

const MedMan = {
    season: {       

        getInfo: function (seriesName, callback) {
            const cwd = process.cwd();
            const filesArray = fs.readdirSync(cwd);
            callback(null, {
                dir: cwd,
                files: filesArray,
                seriesName: seriesName
            });
        },

        isMedia: function (fname) {
            const validExtensions = [
                "avi",
                "mp4",
                "mkv"
            ];
            let extension = fname.slice(-3);
            return validExtensions.includes(extension);
        },
        
        getIdentifier: function (fname, callback) {
            let re = /s\d{2}e\d{2}/gi;
            let ident = fname.match(re);
            callback(null, ident);
        },

        parseFiles: function (infoObject, callback) {

            for (let index in infoObject.files) {
                let fname = infoObject.files[index];
                
                if (this.isMedia(fname)) {
                    this.getIdentifier(fname, (err, res) => {
                        let newName = `${infoObject.seriesName} - ${res}${fname.slice(-4)}`;
                        fs.renameSync(fname, newName);
                        console.log(`${fname} was renamed to ${newName}`);
                    });
                }
            }
        },

        run: function (seriesName) {
            this.getInfo(seriesName, (err, res) => {
                if (err) {
                    console.error(err);
                }
                this.parseFiles(res);
            });
        }
    }
};

const Main = {
    season: seriesName => {
        MedMan.season.run(seriesName);
    }
};

program
    .command('season <seriesName>')
    .description('Tidies up filenames of episodes in current working directory')
    .action(Main.season);

program.parse(process.argv);