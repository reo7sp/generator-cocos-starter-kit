'use strict';

var yeoman = require('yeoman-generator');
var path = require('path');
var mkdirp = require('mkdirp');
var extend = require('extend');
var fs = require('fs');
var chalk = require('chalk');


var MyBase = yeoman.Base.extend({
  commandSync: function (commandArray) {
    this.log.info('... Running ' + chalk.yellow(commandArray.join(' ')) + ' ...');

    var result = this.spawnCommandSync(commandArray[0], commandArray.slice(1), {stdio: 'inherit'})

    if (result.error) {
      this.log.error('Failed ' + chalk.yellow(commandArray.join(' ')));;
      throw result.error;
    }
    this.log.info('Done ' + chalk.yellow(commandArray.join(' ')));;
  }
});

module.exports = MyBase.extend({
  initializing: function () {
    this.props = {};
  },

  prompting: function () {
    var prompts = [{
      name: 'name',
      message: 'Game name',
      default: path.basename(process.cwd())
    }, {
      name: 'package',
      message: 'Package id',
      default: ''
    }, {
      name: 'author',
      message: 'Author of game',
      default: ''
    }];

    return this.prompt(prompts).then(function (props) {
      this.props = props;
    }.bind(this));
  },

  cd: function () {
    if (path.basename(this.destinationPath()) === this.props.name) {
      return;
    }

    mkdirp(this.destinationPath(this.props.name));
    this.destinationRoot(this.destinationPath(this.props.name));
  },

  cocosNew: function () {
    var originalRoot = this.destinationPath();

    this.destinationRoot(this.destinationPath('cocos-tmp'));
    this.commandSync(['cocos', 'new', '-l', 'js', '-p', this.props.package, this.props.name]);
    this.destinationRoot(originalRoot);

    var cocosFiles = fs.readdirSync(this.destinationPath('cocos-tmp', this.props.name));
    cocosFiles.forEach(function (file) {
      var from = this.destinationPath('cocos-tmp', this.props.name, file);
      var to = this.destinationPath(file);
      fs.renameSync(from, to);
    }.bind(this));

    fs.rmdirSync(this.destinationPath('cocos-tmp', this.props.name));
    fs.rmdirSync(this.destinationPath('cocos-tmp'));
  },

  gitClone: function () {
    this.remote('reo7sp', 'cocos-starter-kit', function (err, remote) {
      if (err) {
        throw err;
      }

      remote.directory('.', this.destinationPath());

      var packageJson = this.fs.readJSON(this.destinationPath('package.json'));
      extend(packageJson, {
        name: this.props.name,
        description: '',
        author: this.props.author
      });
      ['repository', 'bugs', 'homepage'].forEach(function (it) {
        delete packageJson[it];
      });
      this.fs.writeJSON(this.destinationPath('package.json'), packageJson);

      ['LICENSE', 'README.md'].forEach(function (it) {
        this.fs.delete(this.destinationPath(it));
      }.bind(this));
    }.bind(this));
  },

  install: function () {
    this.installDependencies({bower: false});
  }
});
