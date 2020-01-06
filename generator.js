const prompts = require('prompts');
const fs = require("fs");
const {execSync} = require('child_process');
const unpack = require('tar-pack').unpack;
const path = require('path');
const request = require('request');

const questions = [
    { 
        type: 'text', 
        name: 'projectName', 
        message: 'Enter project name',
        validate: function (value) {
            if (value.length > 0) {
                return true;
            }
            return "Please enter a valid project name.";
        }
    },{ 
        type: 'text', 
        name: 'portNumber', 
        message: 'Enter port number',
        initial: 8080,
        validate: function (value) {
            value = parseInt(value);
            if (/^[0-9]{1,5}$/.test(value) && value >= 0 && value <= 65535) {
                return true;
            }
            return "Please enter a valid port number.";
        }
    },{ 
        type: 'text', 
        name: 'dbName', 
        message: 'Enter database name',
        validate: function (value) {
            if (value.length > 0) {
                return true;
            }
            return "Please enter a valid database name.";
        }
    },
    { 
        type: 'confirm', 
        name: 'enableClustering', 
        message: 'Do you want to enable clustering through child_process module?', 
        default: false 
    },
    {
        type: 'select', 
        name: 'env', 
        message: 'Please select environment to set', 
        choices: ["development", "production"],
        initial: 0
    }
];

const checkIfDirExistsOrEmpty = (root) => {
  try {
    const files = fs.readdirSync(root);
    return { exists: true, isEmpty: files.length === 0 };
  } catch (e) {
    // Directory doesn't exists, OK to continue
    return { exists: false };
  }
}

const downloadAndUnPackKit = (root, templateToInstall, templateFormat, templateHost, templateHostUser) => {
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

const createApp = (root, appName, templateToInstall, templateFormat, templateHost, templateHostUser) => {
  const dirInfo = checkIfDirExistsOrEmpty(root);
  if (dirInfo.exists && !dirInfo.isEmpty) {
    // directory already exists and is not empty, throw error 
    throw new Error(`Directory with name '${appName}' already exists. Please specify some other project name`);
  }
  // create dir if doesn't exists
  if (!dirInfo.exists) {
    fs.mkdirSync(root); 
  }
  // directory is empty, OK to continue
  return downloadAndUnPackKit(root, templateToInstall, templateFormat, templateHost, templateHostUser);
}
const getPackageJsonContents = (appName, path) => {
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
const installNpmPackages = (root) => {
  console.log("Installing dependencies...");
  execSync(`cd ${root} && npm i`, {stdio: 'inherit'});
  console.log("Dependencies installed.");
}

const addDotEnv = (root, data) => {
  const envPath = path.join(root, ".env");
  fs.writeFileSync(envPath, `PORT=${data.port}
  ENV="${data.env || "development"}"
  IS_CLUSTERING_ENABLED=${data.enableClustering}
  SECRET="some secret"
  MONGO_URI="mongodb://localhost:27017/${data.databaseName}"`);
}

(async () => {

    try {
        const response = await prompts(questions);
        const root = path.resolve(response.projectName);
        const appName = path.basename(root);
        const templateToInstall = "node-mongo-starter-kit";
        const templateFormat = "tarball";
        const templateHost = "api.github.com";
        const templateHostUser = "habilelabs";
        console.log("Creating app...");
        await createApp(root, appName, templateToInstall, templateFormat, templateHost, templateHostUser);
        console.log("Created folder structure.");
        const pjPath = path.join(root, "package.json");
        const contents = getPackageJsonContents(appName, pjPath);
        fs.writeFileSync(pjPath, JSON.stringify(contents, null, 4));
        addDotEnv(root, response);
        console.log("Created '.env' file");
        installNpmPackages(root);
        console.log("App created.");
        console.log();
        console.log(`Start your app by moving into the "${appName}" directory and running
        npm start`);
        console.log();
        console.log("NOTE:- Don't forget to start mongoDB :)")
        console.log();
        console.log("Visit https://github.com/habilelabs/node-mongo-starter-kit for more information on this starter kit.");
        
    } catch (err) {
        console.log(err);
    }
  })();
