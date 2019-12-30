#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const axios = require('axios');
var FormData = require('form-data');

const working_dir = process.cwd();
const config_path = path.join(working_dir, "knowq.config");
let config = JSON.parse(fs.readFileSync(config_path));

let kb_path = path.isAbsolute(config.KB_MODEL) ? config.KB_MODEL : path.join(working_dir, config.KB_MODEL);

if (process.argv[2] === "deploy") {
    var formData = new FormData();
    let filePath = path.join(kb_path, "concepts/LINE_SEGMENT.json");
    formData.append("concepts/LINE_SEGMENT.json", fs.createReadStream(filePath));
    const formHeaders = formData.getHeaders();
    axios.put(config.KB_HOST+"/deploy", formData, {
        headers: {
            ...formHeaders
        }
    }).then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err);
    })
}