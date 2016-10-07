package workflows.server;

import ccc.compute.Definitions;

import haxe.remoting.JsonRpc;

import promhx.PromiseTools;
import promhx.RequestPromises;

using promhx.PromiseTools;

class WorkflowTools
{
	static function correctUrl(url :String)
	{
		return url.startsWith('http') ? url : 'http://ccc:9000/' + url;
	}

	public static function executeWorkflow(workflow :WorkflowJsonClient) :Promise<WorkflowJsonClient>
	{
		traceRed('executeWorkflow');
		var ccc = t9.remoting.jsonrpc.Macros.buildRpcClient(ccc.compute.ServiceBatchCompute, false)
			.setConnection(new t9.remoting.jsonrpc.JsonRpcConnectionHttpPost('http://ccc:9000/api/rpc'));
		traceRed('created CCC proxy');

		// return ccc.jobs()
		// 	.then(function(jobs) {
		// 		traceMagenta('jobs=$jobs');
		// 		return null;
		// 	});


		function getInputValueForNode(node :NodeJson, fieldName :String, previous :JobResult) {
			var nodeIndex = workflow.nodes.indexOf(node);
			// var previousNode = workflow.nodes[nodeIndex - 1];
			trace('sdfsfdsdfddf');
			if (previous.outputs != null && previous.outputs.has(fieldName)) {
				return correctUrl(previous.outputsBaseUrl + fieldName);
			}
			return null;
			// var previousNodeOutput = previousNode.outputs.find(function(output) return output.name == fieldName);
			// return previousNodeOutput != null ? previousNodeOutput.
			// if (previousNodeOutput != null) {
			// 	return 
			// }
			// var edges = workflow.edges;
			// for (edge in workflow.edges) {
			// 	if (edge.source.node == previousNode.id && edge.target.node == node.id && edge.target.field == fieldName) {
			// 		var sourceFieldId = edge.source.field;
			// 		var url = previous.outputsBaseUrl + sourceFieldId;
			// 		if (!url.startsWith('http')) {
			// 			url = 'http://ccc:9000/' + url;
			// 		}
			// 		return url;
			// 	}
			// }
			return null;
		}

		function submitNode(node :NodeJson, ?previous :JobResult) :Promise<JobResult>
		{
			traceYellow('submitNode node=${node}');
			var nodeIndex = workflow.nodes.indexOf(node);
			var inputs = [];
			if (previous != null) {
				previous.outputs = previous.outputs.filter(function(o) return o != null && o != "");
				for (input in previous.outputs) {
					// var inputCloned = {
					// }
					// traceYellow('getInputValueForNode(node, cast input.name=${input.name}, previous)=' + getInputValueForNode(node, cast input.name, previous));
					// inputCloned.value = getInputValueForNode(node, cast input.name, previous);
					// inputCloned.
					inputs.push({
						name: input,
						type: InputSource.InputUrl,
						value: correctUrl(previous.outputsBaseUrl + input)
					});
				}
			// } else {
			// 	inputs.push(input);
			}

			var jobRequest :BasicBatchProcessRequest = {
				inputs: inputs,//.filter(function(i) return i.value != null),
				image: node.docker.image,
				cmd: node.docker.command,
				wait: true
			}
			traceYellow('jobRequest=${jobRequest}');
			return ccc.submitJobJson(jobRequest);
		}

		var results = new Map<NodeId, JobResult>();

		// traceMagenta('workflow=$workflow');
		var promises = workflow.nodes.map(function(node) {
			return function() {
				var nodeIndex = workflow.nodes.indexOf(node);
				traceCyan('nodeIndex=${nodeIndex}');
				var previous = if (nodeIndex > 0) {
					results.get(workflow.nodes[nodeIndex - 1].id);
				} else {
					null;
				}
				traceCyan('previous=${previous}');
				return submitNode(node, previous)
					.then(function(jobResult) {
						results.set(node.id, jobResult);
						return true;
					});
			}
		});

		return PromiseTools.chainPipePromises(promises)
			.pipe(function(_) {
				var promises = [];
				var finalResult :WorkflowJsonClient = Json.parse(Json.stringify(workflow));
				traceYellow('  finalResult=${Json.stringify(finalResult, null, "  ")}');
				for (node in finalResult.nodes) {
					var jobResult = results.get(node.id);
					traceMagenta('jobResult=${Json.stringify(jobResult, null, "  ")}');
					jobResult.outputs = jobResult.outputs.filter(function(o) return o != null && o != "");
					node.outputs = jobResult.outputs.map(function(o) {
						var outputUrl = jobResult.outputsBaseUrl + o ;
						if (!outputUrl.startsWith('http')) {
							outputUrl = 'http://ccc:9000/' + outputUrl;
						}
						var result :ComputeInputSource = {
							name: o,
							type: InputSource.InputUrl,
							value: outputUrl
						}
						return result;
					});
					// for (output in node.outputs) {
					// 	output.value = jobResult.outputs.has(output.name) ? jobResult.outputsBaseUrl + output.name : null;
					// 	if (output.value != null && !output.value.startsWith('http')) {
					// 		output.value = 'http://ccc:9000/' + output.value;
					// 	}
					// 	output.type = InputSource.InputUrl;
					// }
					jobResult.inputs = jobResult.inputs.filter(function(o) return o != null && o != "");
					node.inputs = jobResult.inputs.map(function(o) {
						var inputUrl = jobResult.inputsBaseUrl + o ;
						if (!inputUrl.startsWith('http')) {
							inputUrl = 'http://ccc:9000/' + inputUrl;
						}
						var result :ComputeInputSource = {
							name: o,
							type: InputSource.InputUrl,
							value: inputUrl
						}
						return result;
					});
					// for (input in node.inputs) {
					// 	input.value = jobResult.inputs.has(input.name) ? jobResult.inputsBaseUrl + input.name : null;
					// 	if (input.value != null && !input.value.startsWith('http')) {
					// 		input.value = 'http://ccc:9000/' + input.value;
					// 	}
					// 	input.type = InputSource.InputUrl;
					// }
					Reflect.setField(node, 'exitCode', jobResult.exitCode);

					function getStdOutErr(node) {
						promises.push(RequestPromises.get('http://ccc:9000/${jobResult.stdout}')
							.then(function(out) {
								traceRed('out=${out}');
								Reflect.setField(node, 'stdout', out);
								return true;
							})
							.errorPipe(function(err) {
								Log.error(err);
								return Promise.promise(true);
							}));
						promises.push(RequestPromises.get('http://ccc:9000/${jobResult.stderr}')
							.then(function(out) {
								traceRed('out=${out}');
								Reflect.setField(node, 'stderr', out);
								return true;
							})
							.errorPipe(function(err) {
								Log.error(err);
								return Promise.promise(true);
							}));
					}
					getStdOutErr(node);
				}
				traceYellow('finalResult FINAL  =${Json.stringify(finalResult, null, "  ")}');
				return Promise.whenAll(promises)
					.then(function(_) {
						var resultString = Json.stringify(finalResult);
						traceRed('resultString=$resultString');
						resultString = resultString.replace('ccc:9000', 'localhost:9000');
						traceGreen('resultString=$resultString');
						// http://12fa7d47.ngrok.io/api/rpc/`
						
						return Json.parse(resultString);
					});
			});
	}
}