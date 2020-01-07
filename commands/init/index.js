const inquirer = require('inquirer');
const values = require('./values');
const colors = require('colors');
var fs = require('fs-extra');
var path = require('path');
var ncp = require('ncp').ncp;
var appDir = path.dirname(require.main.filename);
const workingDir = process.cwd();

ncp.limit = 16;

const questions = [
    { type: 'list', name: 'setupType', message: 'Setup a new KnowQueue server or deploy to an existing server?', choices: values.setupTypes },
];

module.exports = () => {
    inquirer
    .prompt(questions)
    .then(function (answers) {
        if (answers.setupType === values.setupTypes[0]) {
            ncp(path.join(appDir, "starter_packs", "create_new_knowledgebase_docker"), workingDir, function (err) {
                if (err) {
                  return console.error(err);
                }
                const knowledgebaseDirs = [
                    path.join(workingDir,'knowledgebase','concepts'),
                    path.join(workingDir,'knowledgebase','hierarchy'),
                    path.join(workingDir,'knowledgebase','relations'),
                    path.join(workingDir,'knowledgebase','rules')
                ];
                knowledgebaseDirs.map(dir => {
                    fs.ensureDirSync(dir);
                })
                console.log(colors.grey('Run KnowQueue server: '),'\"docker-compose up\"');
                console.log(colors.grey('Add some knowledge to folder:'),'/knowledgebase');
                console.log(colors.grey('Commit changes to KnowQueue server: '),'\"knowq deploy\"');
            });
        }
    });
}