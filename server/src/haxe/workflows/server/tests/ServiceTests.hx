package workflows.server.tests;


import haxe.unit.async.PromiseTest;
import haxe.unit.async.PromiseTestRunner;

import minject.Injector;

import promhx.PromiseTools;

using t9.util.ColorTraces;


/**
 * Run tests via RPC or curl/HTTP.
 */
class ServiceTests
{
	@inject
	public var _injector :Injector;

	@rpc({
		alias:'test',
		doc:'Run all server functional tests'
	})
	public function runServerTests() :Promise<CompleteTestResult>
	{
		trace('Running tests');

		var targetHost :Host = 'localhost:$SERVER_DEFAULT_PORT';
		var runner = new PromiseTestRunner();

		// runner.add(new TestWebsockets(targetHost));
		runner.add(new TestWorkflows(targetHost));
		// runner.add(new TestBridge(targetHost));

		var exitOnFinish = false;
		var disableTrace = true;
		return runner.run(exitOnFinish, disableTrace)
			.then(function(result) {
				result.tests.iter(function(test) {
					if (test.error != null) {
						trace(test.error.replace('\\n', '\n').red());
					}
				});
				return result;
			});
	}

	public function new() {}
}