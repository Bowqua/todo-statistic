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
    const comments = getAllComments(files);
    switch (command) {
    const trimmed = command.trim();
    const spaceIndex = trimmed.indexOf(' ');
    const head = spaceIndex === -1 ? trimmed : trimmed.slice(0, spaceIndex);
    const arguments = spaceIndex === -1 ? '' : trimmed.slice(spaceIndex + 1).trim();

    switch (head) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            comments.forEach(comment => {
                console.log(comment)
            })
            break;
        case 'sort importance':
            let copy = structuredClone(comments);
            const importanceSorted = copy.sort((a, b) => {
                const countA = (a.match('/!/g') || []).length;
                const countB = (b.match('/!/g') || []).length;
                return countB - countA;
            });
            importanceSorted.forEach(comment => {
                console.log(comment)
            })
            break;
        case 'sort user':
            let userComments = structuredClone(comments);
            let objs = [];
            userComments.forEach(comment => {
                let line = comment.split(';');
                let obj = {
                    name: line[0],
                    other: line.slice(1)
                }
                objs.push(obj);
            })
            const grouped = Object.groupBy(objs, (obj) => obj.name);
            for (const key in grouped) {
                console.log(`${key}:`);
                grouped[key].forEach(obj => {
                    console.log(`${obj.other.join(',')}`);
                });
            }
            break;
        case 'sort date':
            let dateComments = structuredClone(comments);
            let dobjs = [];
            dateComments.forEach(comment => {
                let line = comment.split(';');
                let obj = {
                    date: line[1],
                    other: line
                }
                dobjs.push(obj);
            })
            const sorted = dobjs.sort((a, b) => {
                const dateA = a.date ? a.date.trim() : '';
                const dateB = b.date ? b.date.trim() : '';
                if (dateA === '' && dateB !== '') return 1;
                if (dateA !== '' && dateB === '') return -1;
                return dateA.localeCompare(dateB);
            })
            sorted.forEach(obj => {
                console.log(obj)
            })
            break;
        case 'important':
            const comments = getAllComments(files);
            const importantComments = comments.filter(todo => todo.text.includes('!'));
            for (const comment of importantComments) {
                console.log(comment);
            }
            break;
        case 'user':
            const todos = getAllComments(files);
            const username = arguments.toLowerCase();
            const filtered = todos.filter(item => (item.user || '').toLowerCase() === username);

            filtered.forEach(data => console.log(`${data.user}; ${data.date}: ${data.text}`));
            break;

        default:
            console.log('wrong command');
            break;
    }

    readLine(processCommand);
}

function getAllComments(files) {
    let comments = [];

    files.forEach(file => {
        const lines = file.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            const marker = '// TODO ';
            const position = trimmed.indexOf(marker);

            if (position === -1) {
                continue;
            }

            const payload = trimmed.slice(position + marker.length).trim();
            const todo = parseTodo(payload);
            comments.push(todo);
        }
    })
    return comments;
}

function parseTodo(payload) {
    const parts = payload.split(';').map(part => part.trim());
    if (parts.length >= 3) {
        return {
            user: parts[0],
            date: parts[1],
            text: parts.slice(2).join(';')
        }
    }

    return {
        user: null,
        date: null,
        text: payload
    }
}
