'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-cocos-starter-kit:app', function () {
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({name: 'test'})
      .toPromise();
  });

  it('uploads kit', function () {
    assert.file([
      'package.json',
      'gulpfile.coffee',
      'app/index.html',
      'app/scripts/main.coffee',
      'app/styles/main.sass',
      'app/templates/_base.html'
    ]);
  });

  it('updates package.json', function () {
    assert.noJsonFileContent('package.json', {
      name: 'cocos-starter-kit',
      description: 'Boilerplate for sites',
      author: 'Oleg Morozenkov'
    });
  });

  it('deletes kit-specific files', function () {
    assert.noFile(['LICENSE', 'README.md']);
  });
});
