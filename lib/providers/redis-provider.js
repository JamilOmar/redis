'use strict';

const redis = require('redis'),
assert = require('assert'),
flatten = require('flat'),
unflatten = require('flat').unflatten,
 _ = require('lodash');

/**
 *
 * @Throws {Error} if the given the given router is not an Express JS router or one of the provided options
 * is not valid
 * @param {Object} options - List of connection information for Redis access.
 *
 * options:
 * {Object} options.connection - Connection string information for Redis.
 * {Object} options.logger - Error logging provider. It must define an `error` function. Default: null
 * {Array} options.configuration - Redis API configuration. Default: null
 *
 * @constructor
 */
class RedisProvider 
{
    constructor(options={})
    {
        
        this.client = null;
        if(options.configuration && options.configuration.maxTime)
            assert.ok(typeof options.configuration.maxTime === "number" && options.configuration.maxTime  >0, '`options.configuration` must define `maxTime` as a valid number');
        if (options.logger)
            assert.ok(_.isFunction(options.logger.error), '`options.logger` must define an `error` function');
        this.options = _.defaults(options, {
            logger: null,
            configuration: {},connection:{}   
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
            this.client = redis.createClient(this.options.connection);
        } catch (error) {
            error.message = 'Failed to stablish a connection with Redis: ' + error.message;
            this._handleError(error);
        }
    };    
    /**
     * @description Saves the object in cache
     * @param {string} [key] - The unique ID used for cache the object.
     * @param {object} [data] - The object for cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     */    
    saveObjectCache(key,data, callback)
    {
        try 
        {
            let newData = this._setObjectValue(data);
                //creating the object in redis
                this.client.hmset(key, {newData}
                , (error) =>{

                //if maxTime is set, setting expiracy to the object in redis
                    if(this.options.configuration.maxTime)
                    {
                        this.client.expire(key, this.options.configuration.maxTime);   
                    }   
                   return callback(error,data);
                });
	    }
     catch(error) {

		return callback(error,null);
	}

    };
    /**
     * @description Gets the object from cache
     * @param {string} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     */    
    getObjectCache(key, callback) {
	try {
		this.client.hgetall(key, (error, reply)=> 
        {
			return callback(error,this._formatObjectValue(reply));
		});
	} catch(error) {

		return callback(error,null);
	}
};

    /**
     * @description Saves the value in cache
     * @param {string} [key] - The unique ID used for cache the object.
     * @param {object} [data] - The object for cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     */    
    saveCache(key,data, callback)
    {
        try 
        {
            //creating the object in redis
            if(data)
            {
                this.client.set(key, this._setValue(data), (error) =>{
                //if maxTime is set, setting expiracy to the object in redis
                    if(this.options.configuration.maxTime)
                    {
                    this.client.expire(key, this.options.configuration.maxTime);   
                    }
                    callback(error,data);
                });   
                
            }
            else callback(null,null);
           
	    }
     catch(error) {

		return callback(error,null);
	}

    };
    /**
     * @description Gets the value from cache
     * @param {string} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     */
    getCache(key, callback) {
	try {
		this.client.get(key, (error, reply)=> 
        {
            if(reply)
				return callback(error,this._formatValue(reply));
             else
              return callback(null,null);
		});
	} catch(error) {

		return callback(error,null);
	}
};

    /**
     * @description Deletes object from cache
     * @param {string} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     */    


    deleteCache(key, callback) {
	try {
		this.client.del(key, (error, reply)=> 
        {
				return callback(error,reply);
		});
	} catch(error) {

		return callback(error,null);
	}
};
 /**
     * @description Method for terminate the connection with Redis.
     */
    quit()
    {
        try {
        
            this.client.quit(); 
            return;

        } catch (error) {
            error.message = 'Failed to quit in the PubSub: ' + error.message;
            this._handleError(error);
        }

    };
 _setValue(value)
 {
     return (value)?JSON.stringify(value):null;
    
 };
 _formatValue(value)
 {
     return (value)?JSON.parse(value):null;
    
 }

 _setObjectValue(value)
 {
    return JSON.stringify(value);

 }

  _formatObjectValue(value)
 {
     return (value)?JSON.parse(value):null;
    
 }


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

}
module.exports = RedisProvider;