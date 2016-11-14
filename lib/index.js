'use strict';

const redisProvider = require('./providers/redis-provider'),
 _ = require('lodash'),
assert = require('assert')

/**
 *
 * @param {Object} options - conection type
 * options:
 * {Object} options.connection - Provider connection information
 * {Object} options.logger - Error logging provider. It must define an `error` function. Default: null
 * {String} options.type - Provider type
 * redis-provider : Data adapter for redis 
 *
 * @constructor
 */
class Cache 
{
    constructor(options={})
    {        
        this.provider = null;
        if(options.type != null)
        assert.ok(options.type === "redis-provider", 'Only redis provider is enabled a this time');
        this.options = _.defaults(options, {
        logger: null,
        type: "redis-provider",
        connection: {
            },
           
        });
        
    };
    /**
     * @description Assigns all the connection and configuration information for the Redis provider for LabShare
     *
     * Throws an exception when:
     *   - Is unable to create a connection with Redis
     *   
     */
    initialize() {
        try {
             this.provider  = new redisProvider(this.options);
             this.provider.initialize();
        } catch (error) {
            error.message = 'Failed to setup the cache functionality: ' + error.message;
            this._handleError(error);
        }
    };  
    /**
     * @description Saves the value  in cache
     * @param {array} [objectID] - The unique ID used for cache the object.
     * @param {string} [data] - The value for cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     */    
    saveCache(objectID,data, callback)
    {
        try 
        {

            let key = this._createKey(objectID);
            //creating the object in redis
            this.provider.saveCache(key, data, (error) =>{
                return callback(error,data);
            });
             

	    }
        catch(error) {
            this._handleError(error);  
	    }

    };
    /**
     * @description Gets the value object from cache
     * @param {array} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     */    
    getCache(objectID, callback) {  
        try 
            {
                let key = this._createKey(objectID);
                //creating the object in redis
                this.provider.getCache(key, (error,reply) =>{
                
                return callback(error,reply);
                });
	        }
        catch(error) 
        {
            this._handleError(error);  
	    }
	
};

    /**
     * @description Saves the object in cache
     * @param {array} [objectID] - The unique ID used for cache the object.
     * @param {object} [data] - The object for cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     */    
    saveObjectCache(objectID,data, callback)
    {
        try 
        {

            let key = this._createKey(objectID);
            //creating the object in redis
            this.provider.saveObjectCache(key, data, (error) =>{
                return callback(error,data);
            });
             

	    }
        catch(error) {
            this._handleError(error);  
	    }

    };
    /**
     * @description Gets the  object from cache
     * @param {array} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     */    
    getObjectCache(objectID, callback) {  
        try 
            {
                let key = this._createKey(objectID);
                //creating the object in redis
                this.provider.getObjectCache(key, (error,reply) =>{
                return callback(error,reply);
                });
	        }
        catch(error) 
        {
            this._handleError(error);  
	    }
	
}

    /**
     * @description Deletes the serialized object from cache
     * @param {array} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     */    
    deleteCache(objectID, callback) {  
        try 
            {
                let key = this._createKey(objectID);
                //creating the object in redis
                this.provider.deleteCache(key, (error,reply) =>{
                return callback(error,reply);
                });
	        }
        catch(error) 
        {
            this._handleError(error);  
	    }
	
};
    /**
     * @description Method for terminate the connection with the cache provider.
     */
    quit()
    {
       try 
        {
            this.provider.quit();
            return;
	    }
        catch(error) 
        {
            this._handleError(error);  
	    }

    };
    /**
     * @description Exception handler
     * @param {string} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     */   
  _handleError(error) {
        if (this.options.logger) {
            this.options.logger.error(error.stack || error.message || error);
            return;
        }
        throw error;
    };
    /**
     * @description creates the cache unique id
     * @param {Array} [objectID] - Array for ID creation.
     */    
_createKey(objectID) {

    let key = "";
    assert(objectID != null);
    for(let _key of objectID)
    {
        key =(key)? key + ":" + _key : _key;   

    }
    return key;
        
};
}
module.exports = Cache;