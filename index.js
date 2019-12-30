#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const axios = require('axios');
var FormData = require('form-data');

const working_dir = process.cwd();
const config_path = path.join(working_dir, "knowq.config");
let config = JSON.parse(fs.readFileSync(config_path));

let kb_path = path.isAbsolute(config.KB_MODEL) ? config.KB_MODEL : path.join(working_dir, config.KB_MODEL);

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

if (process.argv[2] === "deploy") {
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
        console.log("Successfully deploy knowledgebase. Details:\n");
        console.log(res.data);
    }).catch(err => {
        console.log(err.message);
    })
}