var Client = require('../lib/client')
  , DDoc = require('../lib/ddoc');


describe('Client', function() {
  var client, ddoc;

  beforeEach(function() {
    config = {
      targets: {
        test: {
          url: 'http://localhost:5984/notch',
          auth: 'user:pass'
        }
      }
    };
    ddoc = new DDoc('app');
    client = new Client(config);  
  });

  it('should have a config property', function() {
    expect(client.config).toBeDefined();
  });


  describe('url method', function() {
    var url;

    beforeEach(function() {
      ddoc._rev = '1-12345'
      url = client.url(ddoc, 'test');  
    });
    
    it('should add ddoc._id', function () {
      expect(url).toContain('_design/app');
    });

    it('should add ddoc._rev to querystring', function () {
      expect(url).toContain('?_rev=1-12345');    
    });
    
    it('should add auth', function () {
      expect(url).toContain('user:pass@localhost');
    });
  });  
  

  describe('target method', function() {
    var target;

    beforeEach(function() {
      target = client.target('test');  
    });
    
    it('should get a target from config by name', function() {
      expect(target.url).toBeDefined();
      expect(target.auth).toBeDefined();
    });
  });  

  describe('params method', function() {
    beforeEach(function() {
      params = client.params('PUT', ddoc, 'test');
    });
    
    it('should return an object', function () {
      expect(typeof params).toEqual('object');
    });

    describe('return value', function() {
      it('should have a method property', function() {
        expect(params.method).toBeDefined();
      });

      it('should have a uri property', function() {
        expect(params.uri).toBeDefined();
      });

      it('should have a json property', function () {
        expect(params.json).toBeDefined();
      });
    });  
  });  

  describe('push method', function() {
    // calls this.params and handler.push
    // see those tests.
  });  
  
  describe('draft method', function() {
    // creates a file based on some json schema or Doc inheriting object.
  });  

});
