const fs = require('fs');
const { exec } = require('child_process');

const files = {};

var deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index){
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

function getFile(filename) {
  if (!files.hasOwnProperty(filename)) {
    files[filename] = fs.readFileSync(filename, 'utf-8').split('\n');
  }
  return files[filename];
}

function fixWarning({position, suggestion, errorCode, filename}) {
  if (!suggestion || errorCode === "MissingTypeDeclaration" || errorCode == "WildcardInferredType") {
    return;
  }
  const lines = getFile(filename);
  let {replaceRange: {startLine}, replacement} = suggestion;
  startLine -= 1;
  replacement = replacement.replace(/(\n| {2,})/g, ' ');
  console.log(replacement);
  lines[startLine] = replacement;
  if (lines[startLine] === '') {
    lines[startLine] = 'DELETE';
  }
  for (let i = position.startLine; i < position.endLine; i++) {
    lines[i] = 'DELETE';
  }
}

function main() {
  deleteFolderRecursive('output')
  exec('pulp build -- --json-errors', {maxBuffer: 1024 * 5000}, (err, stdout, stderr) => {
    if (err) {
      throw err;
    }
    console.time('fix');
    const jsonStr = stderr.split('\n').find(str => (str.indexOf('{') !== -1));
    const json = JSON.parse(jsonStr.substr(jsonStr.indexOf('{')));
    const warnings = json.warnings || [];
    warnings.forEach(fixWarning);
    for (const filename in files) {
      const lines = files[filename];
      const str = lines.reduce((code, line) => {
        if (line === 'DELETE') {
          return code;
        }
        return code ? (code + '\n' + line) : line;
      }, null);
      fs.writeFileSync(filename, str);
    }
    console.timeEnd('fix');
  });
}

main();
