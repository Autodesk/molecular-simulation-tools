package workflows.server;

import ccc.compute.Definitions;

/**
 * This is useful to avoid decluttering the
 * code completion of path strings.
 */
abstract WorkflowPath(String)
{
	inline public function new(s:String)
	{
		this = s;
	}
}

@:enum
abstract WorkflowState(String) {
	var stopped = 'stopped';
	var running = 'running';
	var error = 'error';
}

@:enum
abstract WorkflowNodeSource(String) {
	var url = 'url';
	var path = 'path';
	var docker = 'docker';
}

typedef NodeJsonDockerImage = {
	var image :String;
	var command :Array<String>;
}

typedef NodeJson = {
	var id :NodeId;
	var source :WorkflowNodeSource;
	@:optional var docker :NodeJsonDockerImage;
	var inputs :Array<ComputeInputSource>;
	var outputs :Array<ComputeInputSource>;
	@:optional var meta :Dynamic;
	@:optional var error :Dynamic;
}

typedef Connection = {
	var node :NodeId;
	var field :FieldId;
}

typedef EdgeJson = {
	var source :Connection;
	var target :Connection;
}


typedef WorkflowJsonClient = {
	@:optional var id :WorkflowId;
	@:optional var meta :Dynamic;
	@:optional var nodes :Array<NodeJson>;
	@:optional var edges :Array<EdgeJson>;
	/* This is used internally because looking up nodes in arrays is a pain */
	// @:optional var __nodeMap :Map<NodeId, NodeJson>;
}

typedef WorkflowJsonClientDemo = {
	var version :String;
	var workflow :WorkflowJsonClient;
}

abstract WorkflowId(String)
{
	inline public function new(s:String)
	{
		this = s;
	}
}

abstract FieldId(String)
{
	inline public function new(s:String)
	{
		this = s;
	}
}

abstract NodeId(String)
{
	inline public function new(s:String)
	{
		this = s;
	}
}