import shortid from 'shortid';
import WorkflowRecord from '../records/workflow_record';
import WorkflowNodeRecord from '../records/workflow_node_record';
import actionConstants from '../constants/action_constants';
import statusConstants from '../constants/status_constants';

const initialState = new WorkflowRecord();

function workflow(state = initialState, action) {
  switch (action.type) {
    case actionConstants.INITIALIZE_WORKFLOW:
      return state.merge({
        fetching: true,
        fetchingError: false,
      });

    case actionConstants.FETCHED_WORKFLOW:
      if (action.error) {
        return state.merge({
          fetching: false,
          fetchingError: action.error,
        });
      }
      return action.workflow;

    case actionConstants.CLICK_RUN:
      return state.set('workflowNodes', state.workflowNodes.map((workflowNode) => {
        if (!action.workflowNodeIds.contains(workflowNode.id)) {
          return workflowNode;
        }

        return workflowNode.merge({
          status: statusConstants.RUNNING,
          outputs: initialState.outputs,
        });
      }));

    case actionConstants.RUN_ENDED:
      return state.set('workflowNodes', state.workflowNodes.map((workflowNode) => {
        const workflowNodeFromAction = action.workflowNodes.find(
          workflowNodeI => workflowNodeI.id === workflowNode.id
        );
        if (!workflowNodeFromAction) {
          return workflowNode;
        }
        if (action.err) {
          return workflowNode.merge({
            status: action.status,
            fetchingPDB: false,
          });
        }

        return workflowNode.merge({
          status: action.status,
          fetchingPDB: true,
          outputs: workflowNodeFromAction.outputs,
        });
      }));

    case actionConstants.FETCHED_PDB: {
      let workflowNodeIndex;
      const workflowNode = state.workflowNodes.find((workflowNodeI, index) => {
        workflowNodeIndex = index;
        return workflowNodeI.id === action.workflowNodeId;
      });

      if (action.err) {
        return state.set('workflowNodes',
          state.workflowNodes.set(workflowNodeIndex,
            workflowNode.merge({
              fetchingPDB: false,
              fetchingPDBError: action.err,
            })
          )
        );
      }

      return state.set('workflowNodes',
        state.workflowNodes.set(workflowNodeIndex,
          workflowNode.merge({
            fetchingPDB: false,
            fetchingPDBError: null,
            modelData: action.modelData,
          })
        )
      );
    }

    case actionConstants.DROP_NODE: {
      let workflowNode;
      let newIndex = action.workflowNodeIndex + 1;
      let newWorkflowNodes = state.workflowNodes;

      if (action.move) {
        const oldIndex = state.workflowNodes.findIndex(workflowNodeI =>
          workflowNodeI.id === action.draggedId
        );
        workflowNode = newWorkflowNodes.get(oldIndex);

        if (newIndex > oldIndex) {
          newIndex -= 1;
        }

        newWorkflowNodes = newWorkflowNodes.delete(oldIndex);
      } else {
        workflowNode = new WorkflowNodeRecord({ id: shortid.generate(), nodeId: action.draggedId });
      }

      return state.set('workflowNodes', newWorkflowNodes.insert(newIndex, workflowNode));
    }

    case actionConstants.DROP_WORKFLOW_NODE_ON_NODE: {
      const workflowNodeIndex = state.workflowNodes.findIndex(workflowNode =>
        workflowNode.id === action.workflowNodeId
      );
      return state.set('workflowNodes', state.workflowNodes.delete(workflowNodeIndex));
    }

    case actionConstants.UPLOAD:
      return state.merge({
        uploadError: '',
        uploadPending: true,
      });

    case actionConstants.UPLOAD_COMPLETE:
      return state.merge({
        uploadPending: false,
        uploadError: action.err,
        uploadUrl: action.url,
      });

    default:
      return state;
  }
}

export default workflow;
