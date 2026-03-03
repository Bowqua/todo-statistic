const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function processCommand(command) {
    switch (command) {
        case 'exit':
            process.exit(0);
            break;
        default:
            console.log('wrong command');
            break;
    }
}

function getAllComments(files) {
    let comments = [];

    files.forEach(file => {
        const lines = file.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('// TODO ')) {
                comments.push(trimmed.slice(8));
            }
        }
    })
    return comments;
}
