package workflows.server.tests;

import t9.remoting.jsonrpc.JsonRpcConnectionWebSocket;

class TestWebsockets extends ServerAPITestBase
{
	// @timeout(1000)
	// public function testBasicWebsockets() :Promise<Bool>
	// {
	// 	//Client infrastructure
	// 	var clientConnection = new JsonRpcConnectionWebSocket('ws://${_serverHost}');
	// 	var clientProxy = t9.remoting.jsonrpc.Macros.buildRpcClient(workflows.server.ServiceWorkflows, true)
	// 		.setConnection(clientConnection);

	// 	var testWord = Std.string(Std.int(Math.random() * 10000000));
	// 	return clientProxy.test(testWord)
	// 		.then(function(out) {
	// 			assertEquals(out, testWord + testWord);
	// 			clientConnection.ws.close();
	// 			return true;
	// 		});
	// }
	// 
	

	public function new(targetHost :Host)
	{
		super(targetHost);
	}
}