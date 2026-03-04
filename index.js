const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function render(todo) {
    const userPart = todo.user ? `${todo.user}; ` : '';
    const datePart = todo.date ? `${todo.date}; ` : '';
    return `// TODO ${userPart}${datePart}${todo.text}`;
}

function processCommand(command) {
    const comments = getAllComments(files);
    const trimmed = command.trim();
    const spaceIndex = trimmed.indexOf(' ');
    const head = spaceIndex === -1 ? trimmed : trimmed.slice(0, spaceIndex);
    const arguments = spaceIndex === -1 ? '' : trimmed.slice(spaceIndex + 1).trim();

    switch (head) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            comments.forEach(c => console.log(render(c)));
            break;
        case 'important':
            comments
                .filter(c => c.text.includes('!'))
                .forEach(c => console.log(render(c)));
            break;
        case 'user':
            const nameToSearch = arguments.toLowerCase();
            comments
                .filter(c => c.user && c.user.toLowerCase() === nameToSearch)
                .forEach(c => console.log(render(c)));
            break;
        case 'sort':
            let sorted = [...comments];
            if (arguments === 'importance') {
                sorted.sort((a, b) => {
                    const countA = (a.text.match(/!/g) || []).length;
                    const countB = (b.text.match(/!/g) || []).length;
                    return countB - countA;
                });
                sorted.forEach(c => console.log(render(c)));
            } else if (arguments === 'user') {
                const grouped = {};
                comments.forEach(c => {
                    const name = (c.user || 'anonymous').toLowerCase();
                    if (!grouped[name]) grouped[name] = [];
                    grouped[name].push(c);
                });
                Object.keys(grouped).sort().forEach(user => {
                    console.log(`${user}:`);
                    grouped[user].forEach(c => console.log('  ' + render(c)));
                });
            } else if (arguments === 'date') {
                sorted.sort((a, b) => {
                    const dateA = a.date || '0000-00-00';
                    const dateB = b.date || '0000-00-00';
                    return dateB.localeCompare(dateA);
                });
                sorted.forEach(c => console.log(render(c)));
            }
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
