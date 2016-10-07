package workflows.server;

import ccc.compute.ConnectionToolsRedis;

import haxe.remoting.JsonRpc;

import t9.js.jsonrpc.Routes;

import js.Error;
import js.Node;
import js.node.Fs;
import js.node.Path;
import js.node.Process;
import js.node.http.*;
import js.node.Http;
import js.node.Url;
import js.node.stream.Readable;
import js.npm.RedisClient;
import js.npm.docker.Docker;
import js.node.express.Express;
import js.node.express.Application;
import js.npm.Ws;
import js.npm.RedisClient;

import minject.Injector;

import promhx.RequestPromises;
import promhx.RetryPromise;

/**
 * Represents a queue of compute jobs in Redis
 * Lots of ideas taken from http://blogs.bronto.com/engineering/reliable-queueing-in-redis-part-1/
 */
class Server
{
	static function main()
	{
		Node.process.on(ProcessEvent.UncaughtException, function(err) {
			traceRed('UncaughtException');
			var errObj = {
				stack:try err.stack catch(e :Dynamic){null;},
				error:err,
				errorJson: try untyped err.toJSON() catch(e :Dynamic){null;},
				errorString: try untyped err.toString() catch(e :Dynamic){null;},
				message:'crash'
			}
			//Ensure crash is logged before exiting.
			// Log.critical(errObj);
			traceRed(Std.string(errObj));
			Node.process.exit(1);
		});

		//Required for source mapping
		js.npm.sourcemapsupport.SourceMapSupport;
		ErrorToJson;
		Node.process.stdout.setMaxListeners(100);
		Node.process.stderr.setMaxListeners(100);

		//Begin building everything
		var injector = new Injector();
		injector.map(Injector).toValue(injector); //Map itself

		Promise.promise(true)
			.pipe(function(_) {
				return setupRedis(injector);
			})
			.pipe(function(_) {
				return verifyCCC(injector);
			})
			.then(function(_) {
				appSetUp(injector);
				appAddPaths(injector);
				setupServer(injector);
				// ServerWebsocket.createWebsocketServer(injector);
				runTests(injector);
			});
	}

	static function appSetUp(injector :Injector)
	{
		// //Load env vars from an .env file if present
		// Node.require('dotenv').config({path: '.env', silent: true});
		// Node.require('dotenv').config({path: 'config/.env', silent: true});

		var app :Application = Express.GetApplication();

		// Your own super cool function
		var logger = function(req, res, next) {
			traceGreen('req url${req.originalUrl} hostname=${req.hostname} method=${req.method}');
			next(); // Passing the request to the next handler in the stack.
		}
		app.use(cast logger);
		untyped __js__('app.use(require("cors")())');
		trace('loaded cors');
		injector.map(Application).toValue(app);
	}

	static function appAddPaths(injector :Injector)
	{
		var app :Application = injector.getValue(Application);

		app.get('/test', function (req, res) {
	        res.send('OK');
	    });

		var router = js.node.express.Express.GetRouter();

		/* @rpc */
		var serverContext = new t9.remoting.jsonrpc.Context();
		injector.map(t9.remoting.jsonrpc.Context).toValue(serverContext);

		//Tests
		var serviceTests = new workflows.server.tests.ServiceTests();
		injector.injectInto(serviceTests);
		serverContext.registerService(serviceTests);

		//Workflows
		var serviceWorkflows = new workflows.server.ServiceWorkflows();
		injector.injectInto(serviceWorkflows);
		serverContext.registerService(serviceWorkflows);
		trace('sdfsdf');
		router.post(SERVER_API_RPC_URL_FRAGMENT, Routes.generatePostRequestHandler(serverContext));
		router.get(SERVER_API_RPC_URL_FRAGMENT + '*', Routes.generateGetRequestHandler(serverContext, SERVER_API_RPC_URL_FRAGMENT));

		//Server infrastructure. This automatically handles client JSON-RPC remoting and other API requests
		app.use(SERVER_API_URL, cast router);

		var computeURL = 'http://ccc:9000';
	    Log.info('computeURL:'+ computeURL);
	    var computeProxy = js.npm.httpproxy.HttpProxy.createProxyServer({target: computeURL});
	    app.get('/*', function (req, res) {
	        computeProxy.web(req, res);
	    });
	}

	static function setupRedis(injector :Injector) :Promise<Bool>
	{
		return ConnectionToolsRedis.getRedisClient()
			.then(function(redis) {
				injector.map(RedisClient).toValue(redis);
				return true;
			});
	}

	static function verifyCCC(injector :Injector) :Promise<Bool>
	{
		var ccc_address = 'http://ccc:9000/status';
		return RetryPromise.pollRegular(function() {
			return RequestPromises.get(ccc_address)
				.then(function(result) {
					traceGreen('$ccc_address = ${result}');
					return true;
				});
			}, 10, 300);
	}

	static function setupServer(injector :Injector)
	{
		var env = Node.process.env;
		var app :Application = injector.getValue(Application);
		//Actually create the server and start listening
		var appHandler :IncomingMessage->ServerResponse->(Error->Void)->Void = cast app;
		// var server = Http.createServer(function(req, res) {
		// 	appHandler(req, res, function(err :Dynamic) {
		// 		traceRed(Std.string(err));
		// 		traceRed(err);
		// 		Log.error({error:err != null && err.stack != null ? err.stack : err, message:'Uncaught error'});
		// 	});
		// });
		var server = Http.createServer(cast app);
		injector.map(js.node.http.Server).toValue(server);

		traceYellow('SERVER_DEFAULT_PORT=${SERVER_DEFAULT_PORT}');
		var PORT :Int = Reflect.hasField(env, 'PORT') ? Std.int(Reflect.field(env, 'PORT')) : SERVER_DEFAULT_PORT;
		traceYellow('PORT=${PORT}');
		server.listen(PORT, function() {
			Log.info('Listening http://localhost:$PORT');
		});

		var closing = false;
		Node.process.on('SIGINT', function() {
			Log.warn("Caught interrupt signal");
			if (closing) {
				return;
			}
			closing = true;
			untyped server.close(function() {
				Node.process.exit(0);
			});
		});
	}

	static function runTests(injector :Injector)
	{
		//Run internal tests
		Log.debug('Running server functional tests');
		var isTravisBuild = Node.process.env['TRAVIS'] + '' == 'true';
		promhx.RequestPromises.get('http://localhost:${SERVER_DEFAULT_PORT}${SERVER_RPC_URL}/test')
			.then(function(out) {
				try {
					var results = Json.parse(out);
					var result = results.result;
					if (result.success) {
						Log.info({TestResults:result});
						traceGreen(Json.stringify(result, null, '  '));
					} else {
						Log.error({TestResults:result});
						traceRed(Json.stringify(result, null, '  '));
					}
					if (isTravisBuild) {
						Node.process.exit(result.success ? 0 : 1);
					}
				} catch(err :Dynamic) {
					Log.error({error:err, message:'Failed to parse test results'});
					if (isTravisBuild) {
						Node.process.exit(1);
					}
				}
			})
			.catchError(function(err) {
				Log.error({error:err, message:'failed tests!'});
				if (isTravisBuild) {
					Node.process.exit(1);
				}
			});
	}
}
