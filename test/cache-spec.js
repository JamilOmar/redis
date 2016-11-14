//TEST Scripts for Redis

let cache = require('../lib');
//base connection
let baseConnection = { "host":"127.0.0.1",
          "port":6379 
    };
//error logger
let logger  = {
error :function (error)
{
        throw error;
}
};
//connection settings for redis client
const redisOptions = {
connection : baseConnection,
logger:logger
};

let randomValue = null; 
let cacheClient = null;
describe("Cache package test", function() {
    
//before any test ,all the pubsub objects are instantiated
beforeEach(function() {

   cacheClient = new cache(redisOptions);
   cacheClient.initialize(); 
  });
//after any test ,all the pubsub objects are set to null
afterEach(function() {  
    cacheClient.quit();
    cacheClient = null;   
  });

it('It will test the storage of a string', function(done) {

    cacheClient.saveCache(['test-string'],20,(error,data)=>
    {
        expect(error).toBeNull();
        done();

    });

});
it('It will test the retreival of a string', function(done) {

    cacheClient.getCache(['test-string'],(error,data)=>
    {
        expect(data).toEqual(20);
        done();

    });

});
it('It will test the deletion of the cache', function(done) {
    cacheClient.deleteCache (['test-string'],(error,data)=>
    {
        expect(error).toBeNull();
        done();

    });

});
it('It will test the retreival of a non-existence string', function(done) {

    cacheClient.getCache(['test-string'],(error,data)=>
    {
         expect(data).toBeNull();
        done();

    });

});

it('It will test the storage of an object', function(done) {
    cacheClient.saveObjectCache(['test-object'],{name:'test',age:20 },(error,data)=>
    {
        expect(error).toBeNull();
        done();

    });

});
it('It will test the retreival of an object', function(done) {
    cacheClient.getObjectCache(['test-object'],(error,data)=>
    {
        expect(data).toEqual({name:'test',age:20 });
        done();

    });

});

xit('It will test the storage of an array', function(done) {

})


xit('It will test the storage of an object with expiracy', function(done) {

})


});