# Starter kit generator
This package includes global command for generating a ready-to-use boiler plate for NodeJs with MongoDB.

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
Once the package is installed, run `habilejs` command.
This will prompt for a few questions to gather information about the app to be created.

### Questions
* Enter project name

    This name will be the name of your app.

* Enter port number

    Port number at which you desire to run your app.

* Enter database name

    Database name to be used by your app

* Do you want to enable clustering through child_process module?

    Whether or not to enable clustering of your app. If enabled,
multiple instances equal to the number of CPU cores will be created upon running

* Please select environment to set

    Environment to set for your app. It can be either `development` or `production`.

> All these settings can be changed later by editing `.env` file.

Once the app is created, `cd` into the app and run `npm start`.

### Starter kit
The starter kit can be found [here](https://github.com/habilelabs/node-mongo-starter-kit)