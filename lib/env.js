var prompt = require('prompt')
  , path = require('path')
  , fs = require('fs');

function Env(config) {
  this.root = process.cwd();

  if (typeof config == 'object') {
    this.config = config;
    this.ddocs = config.ddocs;
    this.models = config.models;
    this.closet = config.skeletons;
    this.buildDataDir();
  } else if (typeof config == 'string') {
    var file = path.join(this.root, config)
      , json = fs.readFileSync(file, 'utf8');

    this.config = JSON.parse(json);
    this.loadDDocs();
    this.loadModels();
    this.buildDataDir();
  } else {
    // load the skeletons
    this.loadSkeletons();
  } 
  
//  if (typeof config == 'object' || typeof config == 'string') this.buildDataDir();

  if (this.config && !this.config.defaults) this.config.defaults = {};
}

module.exports = Env;

/**
 * Ensure required data directories exist
 */

Env.prototype.buildDataDir = function () {
  var env = this
    , dirs = [path.join(env.root, 'data')]
    , targets = Object.keys(env.config.targets)
    , models = Object.keys(env.models);

  targets.forEach(function (target) {
    var targetDir = path.join(process.cwd(), 'data', target);

    dirs.push(targetDir);
    dirs.push(path.join(targetDir, 'ddocs'));

    models.forEach(function (model) {
      dirs.push(path.join(targetDir, model));
    });
  });

  dirs.forEach(function (dir) {
    if (!path.existsSync(dir)) fs.mkdirSync(dir, '0755');
  });
};

/**
 * Create a map of skeletons in the filesystem
 */

Env.prototype.loadSkeletons = function () {
  var env = this
    , closet = path.join(process.env['HOME'], '.notch/closet');

  this.closet = {
    default: path.join(__dirname, '../skeletons/default/')
  };

  if (path.existsSync(closet)) {
    var listings = fs.readdirSync(closet);
    listings.forEach(function (listing) {
      env.closet[listing] = path.join(closet, listing, '/'); 
    });
  }
};


Env.prototype.loadDDocs = function () {
  var env = this
    , config = env.config
    , ddocs = env.ddocs = {};

  if (!config.ddocs) {
    var listings = fs.readdirSync(env.root);

    if (listings.indexOf('ddoc.js') !== -1) {
      var ddoc = path.join(env.root, 'ddoc.js');
      ddocs.app = require(ddoc);
    } else if (listings.indexOf('apps') !== -1) {
      var ddoc
        , apps = fs.readdirSync(path.join(env.root, 'apps'));

      apps.forEach(function (app) {
        ddoc = path.join(env.root, 'apps', app, 'ddoc.js');
        ddocs[app] = require(ddoc);
      });
    }
  } else {
    var paths = config.ddocs;
    if (paths) {
      for (key in paths) {
        ddoc_path = path.join(env.root, paths[key]);
        ddocs[key.toLowerCase()] = require(ddoc_path); 
      }
    }
  }
};

Env.prototype.loadModels = function() {
  this.models = {};
  if (this.config.models) {
    var req_path = path.join(this.root, this.config.models);
    var models = require(req_path);
    for (key in models) {
      this.models[key.toLowerCase()] = models[key];
    }
  }
};

Env.prototype.getDDoc = function (key) {
  if (!key) {
    var defaults = this.config.defaults;
    key = defaults.ddoc || 'app';
  }

  return this.ddocs[key];
};

Env.prototype.getModel = function (key) {
  if (!key) key = this.config.defaults.model; 
  return this.models[key];
};

Env.prototype.getSchema = function (key) {
  return this.models[key].schema;
};

Env.prototype.getTarget = function (key, callback) {
  var targets = this.config.targets
    , target;

  if (!key) {
    for (target in targets) {
      if (targets[target].default) {
        key = target; 
        break;
      }
    }
  }
  
  target = this.config.targets[key];

  if (target.user) {
    prompt.start();
    prompt.get({ name: 'password', hidden: true }, function (err, result) {
      target.auth = target.user + ':' + result.password;
      callback(null, target);
    });
  } else {
    callback(null, target);
  }
};

/**
 *
Env.prototype.validate = function() {
  // validate the environment against a json-schema?
};
*/
