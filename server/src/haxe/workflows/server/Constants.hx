package workflows.server;

import t9.abstracts.net.*;

/**
 *********************************************
 * General DEFINITIONS
 **********************************************
 */

class Constants
{
	/* Networking */
	public static var SERVER_HOSTNAME_PRIVATE :String;
	public static var SERVER_HOSTNAME_PUBLIC :String;

	/* Redis */
	inline public static var SEP = '::';

	inline public static var ENV_VAR_COMPUTE_CONFIG_PATH = 'CONFIG_PATH';
	/* Env vars for running tests*/
	inline public static var ENV_VAR_CCC_ADDRESS = 'CCC';
	inline public static var ENV_LOG_LEVEL = 'LOG_LEVEL';

	/* Server */
	inline public static var SERVER_DEFAULT_PORT = 8765;
	inline public static var REDIS_PORT = 6379;
	inline public static var SERVER_PATH_CHECKS = '/checks';
	inline public static var SERVER_PATH_CHECKS_OK = 'OK';
	inline public static var SERVER_PATH_RELOAD = '/reload';
	inline public static var SERVER_PATH_STATUS = '/status';
	inline public static var SERVER_PATH_READY = '/ready';
	inline public static var SERVER_PATH_WAIT = '/wait';
	inline public static var SERVER_API_URL = '/api';
	inline public static var SERVER_API_RPC_URL_FRAGMENT = '/rpc';
	inline public static var SERVER_RPC_URL = '${SERVER_API_URL}${SERVER_API_RPC_URL_FRAGMENT}';
	public static var SERVER_LOCAL_HOST :Host = new Host(new HostName('localhost'), new Port(SERVER_DEFAULT_PORT));
	public static var SERVER_LOCAL_RPC_URL :UrlString = 'http://${SERVER_LOCAL_HOST}${SERVER_RPC_URL}';
}