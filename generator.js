const {Command} = require("commander");
const fs = require("fs");
const {execSync} = require('child_process');
const unpack = require('tar-pack').unpack;
const path = require('path');
const request = require('request');
const { version, name } = require('./package.json');

const program = new Command(name)
.version(version)
.arguments('<project-name>')
.usage(`<project-name> [options]`)
.action(name => {
    projectName = name;
})
.on("--help", () => {
    console.log("Only <project-name> is required");
})
.option("-p, --port <port>", "port number on which Node app will run")
.option("-dbName, --database-name <name>", "database name for application")
.option("-c, --enable-clustering", "whether to enable clustering(through child process) or not.")
.option("-e, --env <env>", "environment to set for the app. Can be 'development'/'production'")
.parse(process.argv);
if (program.env && program.env !== "development" && program.env !== "production") {
  console.log("Invalid value for argument '--env'");
  process.exit(1);
}

if (typeof projectName === 'undefined') {
    console.error('Please specify the project name:');
    console.log(
      `  ${program.name()} <project-name>`
    );
    console.log();
    console.log('For example:');
    console.log(`  ${program.name()} my-node-app`);
    console.log();
    console.log(
      `Run ${program.name()} --help to see all options.`
    );
    process.exit(1);
}

const root = path.resolve(projectName);
const appName = path.basename(root);
const templateToInstall = "node-mongo-starter-kit";
const templateFormat = "tarball";
const templateHost = "api.github.com";
const templateHostUser = "habilelabs";

const checkIfDirExistsOrEmpty = () => {
  try {
    const files = fs.readdirSync(root);
    return { exists: true, isEmpty: files.length === 0 };
  } catch (e) {
    // Directory doesn't exists, OK to continue
    return { exists: false };
  }
}

const downloadAndUnPackKit = () => {
  return new Promise((resolve, reject)=>{
    request({
      uri: `https://${templateHost}/repos/${templateHostUser}/${templateToInstall}/${templateFormat}/master`,
      headers: {
        'User-Agent': templateToInstall
      }
    }).pipe(unpack(root, (err)=>{
      if (err) {
        return reject(err);
      }
      resolve();
    }));
  });
}

const createApp = () => {
  const dirInfo = checkIfDirExistsOrEmpty();
  if (dirInfo.exists && !dirInfo.isEmpty) {
    // directory already exists and is not empty, throw error 
    throw new Error(`Directory with name '${appName}' already exists. Please specify some other project name`);
  }
  // create dir if doesn't exists
  if (!dirInfo.exists) {
    fs.mkdirSync(root); 
  }
  // directory is empty, OK to continue
  return downloadAndUnPackKit();
}
const getPackageJsonContents = (path) => {
  const packageJson = require(path);
  return {
    name: appName,
    version: "1.0.0",
    main: packageJson.main,
    scripts: packageJson.scripts,
    dependencies: packageJson.dependencies,
    devDependencies: packageJson.devDependencies,
  }
}
const installNpmPackages = () => {
  console.log("Installing dependencies...");
  execSync(`cd ${root} && npm i`, {stdio: 'inherit'});
  console.log("Dependencies installed.");
}

const addDotEnv = () => {
  const envPath = path.join(root, ".env");
  fs.writeFileSync(envPath, `PORT=${program.port || 8080}
  ENV="${program.env || "development"}"
  IS_CLUSTERING_ENABLED=${program.enableClustering || false}
  SECRET="some secret"
  MONGO_URI="mongodb://localhost:27017/${program.databaseName || "node-mongo-demo"}"`);
}

console.log("Creating app...");
createApp().then(() => {
  console.log("Created folder structure.");
  const pjPath = path.join(root, "package.json");
  const contents = getPackageJsonContents(pjPath);
  fs.writeFileSync(pjPath, JSON.stringify(contents, null, 4));
  addDotEnv();
  console.log("Created '.env' file");
  installNpmPackages();
  console.log("App created.");
  console.log();
  console.log(`Start your app by moving into the "${appName}" directory and running
  npm start`);
  console.log();
  console.log("NOTE:- Don't forget to start mongoDB :)")
  console.log();
  console.log("Visit https://github.com/habilelabs/node-mongo-starter-kit for more information on this starter kit.");
}).catch(err => {
  console.log(err.message);
});