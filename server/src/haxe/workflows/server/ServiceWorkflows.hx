package workflows.server;

import ccc.compute.Definitions;

import haxe.unit.async.PromiseTest;
import haxe.unit.async.PromiseTestRunner;
import haxe.remoting.JsonRpc;

import js.npm.Ws;

import minject.Injector;

import promhx.PromiseTools;

import yaml.Yaml;
import yaml.Parser;
import yaml.Renderer;

using js.npm.FsPromises;
using promhx.PromiseTools;

/**
 * One per Websocket connection. Shuts down with the connection is killed
 */
class ServiceWorkflows
{
	@rpc({
		alias:'run',
		doc:'Execute workflow'
	})
	public function run(workflow :WorkflowJsonClient) :Promise<WorkflowJsonClient>
	{
		traceMagenta('run ' + workflow);
		return WorkflowTools.executeWorkflow(workflow);
	}

	@rpc({
		alias:'gallery',
		doc:'Get all available nodes'
	})
	public function getAllNodes() :Promise<Array<NodeJson>>
	{
		return ServiceWorkflows.readWorkflowYaml('test/examples/workflow1/example_workflow.yml')
			.then(function(wf :WorkflowJsonClientDemo) {
				return wf.workflow.nodes;
			});
	}

	public function new() {}


	// @rpc
	// public function test(?echo :String = 'defaultECHO' ) :Promise<String>
	// {
	// 	return Promise.promise(echo + echo);
	// }

	// @rpc
	// public function run() :Promise<Dynamic>
	// {
	// 	trace('RUN! _state=$_state');
	// 	if (_state == WorkflowState.running) {
	// 		throw 'Workflow state=' + WorkflowState.running;
	// 	}
	// 	_state = WorkflowState.running;
	// 	return execute();
	// 	// pushWorkflow();
	// 	// return Promise.promise(true);
	// }

	// @rpc
	// public function stop() :Promise<Bool>
	// {
	// 	_state = WorkflowState.stopped;
	// 	pushWorkflow();
	// 	return Promise.promise(true);
	// }

	// public function new(ws :WebSocket)
	// {
	// 	_ws = ws;
	// }

	// @post
	// public function postInjection()
	// {
	// 	Assert.notNull(_ws);
	// 	loadWorkflow(null);
	// }

	// public function dispose()
	// {
	// 	_injector = null;
	// 	_ws = null;
	// 	_workflow = null;
	// 	_state = null;
	// 	_workflowState = null;
	// }

	// function loadWorkflow(source :Dynamic)
	// {
	// 	readWorkflowYaml('test/examples/workflow1/example_workflow.yml')
	// 		.then(function(wf) {
	// 			_workflow = wf;
	// 			pushWorkflow();
	// 		});
	// }

	// function pushWorkflow(?jsonRpcId :Dynamic = null)
	// {
	// 	if (_ws.readyState == WebSocket.OPEN) {
	// 		var jsonRpcNotify :RequestDef = {
	// 			method: 'workflow',
	// 			jsonrpc: JsonRpcConstants.JSONRPC_VERSION_2,
	// 			params: {workflow: _workflow.workflow, state: _state, workflowState:_workflowState},
	// 			id: jsonRpcId
	// 		}
	// 		_ws.send(Json.stringify(jsonRpcNotify, null, '  '));
	// 	} else {
	// 		Log.error('client ws connection not connected');
	// 	}
	// }

	// function execute()
	// {
	// 	return WorkflowTools.executeWorkflow(_workflow.workflow)
	// 		.then(function(results) {
	// 			_state = WorkflowState.stopped;
	// 			pushWorkflow();
	// 			return results;
	// 		});
	// }

	// @inject
	// public var _injector :Injector;
	// var _ws :WebSocket;
	// var _workflow :WorkflowJsonClientDemo;
	// var _state :WorkflowState;
	// var _workflowState :Dynamic;

	static var DEFAULT_YAML_OPTIONS = new yaml.Parser.ParserOptions().useObjects().strictMode();

	public static function readWorkflowYaml(path :String) :Promise<WorkflowJsonClientDemo>
	{
		return path.readFile()
			.thenF(stringToWorkflow);
	}

	static function stringToWorkflow(s :String) :WorkflowJsonClientDemo
	{
		var workflow :WorkflowJsonClientDemo = Yaml.parse(s, DEFAULT_YAML_OPTIONS);
		return workflow;
	}
}