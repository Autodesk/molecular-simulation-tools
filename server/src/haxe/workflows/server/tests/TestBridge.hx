package workflows.server.tests;

import t9.remoting.jsonrpc.JsonRpcConnectionWebSocket;

import promhx.deferred.DeferredPromise;

class TestBridge extends ServerAPITestBase
{
	@timeout(2000)
	public function XtestLoadWorkflow() :Promise<Bool>
	{
		var promise = new DeferredPromise();
		//Client infrastructure
		var bridge = new workflows.server.bridge.WorkflowClient();
		bridge.workflow.subscribe(function(workflow) {
			promise.resolve(workflow != null);
		});

		return promise.boundPromise;
	}

	@timeout(10000)
	public function testExecuteWorkflow() :Promise<Bool>
	{
		var promise = new DeferredPromise();
		//Client infrastructure
		var bridge = new workflows.server.bridge.WorkflowClient();
		bridge.workflow.subscribe(function(workflow) {
			// traceYellow('workflow=${workflow}');
			bridge.run();
				// .then(function(result) {
				// 	traceGreen('Bridge receives results: ${Json.stringify(result, null, "  ")}');
					// promise.resolve(true);
				// });
		});
		return promise.boundPromise;
	}

	public function new(targetHost :Host)
	{
		super(targetHost);
	}
}