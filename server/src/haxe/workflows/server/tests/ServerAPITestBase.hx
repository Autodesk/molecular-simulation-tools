package workflows.server.tests;

class ServerAPITestBase extends haxe.unit.async.PromiseTest
{
	var _serverHost :Host;
	var _serverHostRPCAPI :UrlString;

	public function new(targetHost :Host)
	{
		_serverHost = targetHost;
		_serverHostRPCAPI = 'http://${_serverHost}${SERVER_RPC_URL}';
	}
}