package workflows.server;

import haxe.remoting.JsonRpc;

import js.npm.Ws;

import minject.Injector;

import t9.js.jsonrpc.Routes;
import t9.remoting.jsonrpc.Context;

class ServerWebsocket
{
	public static function createWebsocketServer(injector :Injector)
	{
		var server = injector.getValue(js.node.http.Server);

		var wss = new WebSocketServer({server:server});
		traceGreen("Creating Websocket Server");

		//Listen to websocket connections.
		wss.on(WebSocketServerEvent.Connection, function(ws) {
			// var location = js.node.Url.parse(ws.upgradeReq['url'], true);
			// you might use location.query.access_token to authenticate or share sessions
			// or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
			Log.info('Client websocket connection established');
			var rpcContext = new t9.remoting.jsonrpc.Context();
			var serviceWorkflows = new ServiceWorkflows(ws);
			rpcContext.registerService(serviceWorkflows);
			injector.injectInto(serviceWorkflows);

			var handler = Routes.generateJsonRpcRequestHandler(rpcContext);

			var sender = function(rpcResponse :ResponseDef) {
				ws.send(Json.stringify(rpcResponse, null, '\t'));
			}
			ws.on(WebSocketEvent.Message, function(message :Dynamic, flags) {
				trace('message=' + Std.string(message));
				handler(message, sender);
			});
			ws.on(WebSocketEvent.Close, function(code, message) {
				Log.info('Client websocket connection ended');
				serviceWorkflows.dispose();
				rpcContext.dispose();
			});
		});
	}
}