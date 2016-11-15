package workflows.server.tests;

import workflows.server.ServiceWorkflows;

class TestWorkflows extends ServerAPITestBase
{
	@timeout(20000)
	public function testWorkflowExecution() :Promise<Bool>
	{
		return ServiceWorkflows.readWorkflowYaml('test/examples/workflow1/example_workflow.yml')
			.pipe(function(wf) {
				return WorkflowTools.executeWorkflow(wf.workflow);
			})
			.then(function(workflowResult) {
				traceGreen('workflowResult=${Json.stringify(workflowResult, null, "  ")}');
				return true;
			});
	}

	public function new(targetHost :Host)
	{
		super(targetHost);
	}
}