const glob = require("glob");

module.exports = (pattern, bundleFileName) => {
  let entries = {};
  let files = glob.sync(pattern);

  for (let file of files) {
    let filePath = "content-scripts";

    let dir = file.replace(/\.\/src\/\w+\//, "").split("/").shift();

    filePath += `/${dir}/${bundleFileName}`;

    if (!entries[filePath]) entries[filePath] = [];
    entries[filePath].push(file);
  }

  return entries;
};