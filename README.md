# Starter kit generator
Generator for node-mongo-starter-kit

### Prerequisites
```
node
```

### installation
Install this package globally using

```
npm install -g starter-kit-generator
```

### Usage
Once the package is installed, run `starter-kit-generator <project-name>`. This will create a ready-to-use boiler plate for NodeJs with MongoDB.

> `<project-name>` is required.

Available options:
```
-V, --version                    output the version number
-p, --port <port>                port number on which Node app will run
-dbName, --database-name <name>  database name for application
-c, --enable-clustering          whether to enable clustering(through child process) or not.
-e, --env <env>                  environment to set for the app. Can be 'development'/'production'
-h, --help                       output usage information
```