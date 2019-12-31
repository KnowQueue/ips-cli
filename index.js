#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const axios = require('axios');
const program = require('commander');
var FormData = require('form-data');

const working_dir = process.cwd();
const config_path = path.join(working_dir, "knowq.config");
if (!fs.existsSync(config_path)) {
  console.log("Not a KnowQueue-initialized directory.");
  console.log("Run \"knowq init\" to initialize this directory.");
  process.exit(1);
}

let config = JSON.parse(fs.readFileSync(config_path));

function walk(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (error, files) => {
      if (error) {
        return reject(error);
      }
      Promise.all(files.map((file) => {
        return new Promise((resolve, reject) => {
          const filepath = path.join(dir, file);
          fs.stat(filepath, (error, stats) => {
            if (error) {
              return reject(error);
            }
            if (stats.isDirectory()) {
              walk(filepath).then(resolve);
            } else if (stats.isFile()) {
              resolve(filepath);
            }
          });
        });
      }))
      .then((foldersContents) => {
        resolve(foldersContents.reduce((all, folderContents) => all.concat(folderContents), []));
      });
    });
  });
}

program
  .name('knowq')
  .usage("command [options]")

program
  .command('init')
  .description('initialize a KnowQueue directory.')
  .action(() => {
    console.log("init");
  })

program
  .command('deploy')
  .description('deploy to a running KnowQueue server.')
  .action(() => {
    let kb_path = path.isAbsolute(config.KB_MODEL) ? config.KB_MODEL : path.join(working_dir, config.KB_MODEL);
    walk(kb_path)
    .then(files => {
        let formData = new FormData();
        files.map(filePath => {
            const fileKey = filePath.substring(kb_path.length+1);
            formData.append(fileKey, fs.createReadStream(filePath));
        })
        const formHeaders = formData.getHeaders();
        return axios.put(config.KB_HOST+"/deploy", formData, {
            headers: {
                ...formHeaders
            }
        })
    }).then(res => {
        console.log("Successfully deploy knowledgebase.\n");
        console.log(res.data);
    }).catch(err => {
        console.log(err.message);
    })
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp();
}