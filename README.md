# Starter kit generator
This package includes global command for generating node-mongo-starter-kit

### Prerequisites
```
node
```

### installation
This package can be installed globally by running

```
npm install -g habilejs
```

### Usage
Once the package is installed, run `starter-kit-generator <project-name>`. 
This will create a ready-to-use boiler plate for NodeJs with MongoDB.

> `<project-name>` is required.

Available options:
```
-V, --version                    output the version number
-p, --port <port>                port number on which Node app will run. Default is 8080
-dbName, --database-name <name>  database name for application. Default is "node-mongo-demo"
-c, --enable-clustering          whether to enable clustering(through child process) or not. Default is false
-e, --env <env>                  environment to set for the app. Can be 'development'/'production'. Default is "development"
-h, --help                       output usage information
```