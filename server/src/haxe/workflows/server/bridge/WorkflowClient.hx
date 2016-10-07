package workflows.server.bridge;

import promhx.PublicStream;

import t9.remoting.jsonrpc.JsonRpcConnectionWebSocket;

typedef WorkflowClientConfig = {
	@:optional var url :String;
	@:optional var sessionId :String;
}

class WorkflowClient
{
	public static function startSession(?config :WorkflowClientConfig) :WorkflowClient
	{
		return new WorkflowClient(config);
	}

	public var workflow (default, null) :WorkflowStore;

	public var run :Void->Void;
	public var stop :Void->Void;
	public var addNode :NodeId->Void;

	public function new(?config :WorkflowClientConfig)
	{
		this.workflow = new WorkflowStore();

		//Set up the connection
		var clientConnection = new JsonRpcConnectionWebSocket('ws://localhost:${SERVER_DEFAULT_PORT}');
		var clientProxy = t9.remoting.jsonrpc.Macros.buildRpcClient(workflows.server.ServiceWorkflows, true)
			.setConnection(clientConnection);

		
		clientConnection.incoming.then(function(message) {
			// trace('message=${message}');
			if (message.method == 'workflow') {
				this.workflow.setState(message.params.workflow);
			}
		});

		_disposers.push(function() {
			clientConnection.dispose();
		});

		run = function() {
			trace('clientProxy.run();');
			clientProxy.run();
		}

		stop = function() {
			clientProxy.stop();
		}
	}

	public function dispose()
	{
		while (_disposers != null && _disposers.length > 0) {
			try {
				var disposer = _disposers.pop();
				disposer();
			} catch(err :Dynamic) {
				Log.error(err);
			}
		}
	}

	var _disposers :Array<Void->Void> = [];
}

class WorkflowStore
{
	public function new()
	{

	}

	public function getState() :WorkflowJsonClientDemo
	{
		return _state;
	}

	public function setState(val :WorkflowJsonClientDemo)
	{
		_state = val;
		_stream.resolve(_state);
	}

	public function subscribe(cb :WorkflowJsonClientDemo->Void) :Void->Void
	{
		var p = _stream.then(function(workflow) {
			cb(workflow);
		});
		return function() {
			p.end();
		}
	}

	public function dispose()
	{
		if (_stream != null) {
			_stream.end();
		}
		_state = null;
	}

	var _state :WorkflowJsonClientDemo;
	var _stream = new PublicStream<WorkflowJsonClientDemo>();
}