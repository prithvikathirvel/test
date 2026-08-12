import { useCallback } from 'react';
import { useNodesState, useEdgesState, addEdge } from 'reactflow';
import { useDispatch } from 'react-redux';
import { setNodes, setEdges, updateSpecification } from '@/redux/slices/flowSlice';

export const useFlow = () => {
  const dispatch = useDispatch();
  const [nodes, setNodesState, onNodesChange] = useNodesState([]);
  const [edges, setEdgesState, onEdgesChange] = useEdgesState([]);

  // Functional update: keeps the callback identity stable so consumers passing
  // it to <ReactFlow onConnect> do not re-run the store updater on every edge
  // change.
  const onConnect = useCallback(
    (params) => {
      setEdgesState((eds) => addEdge(params, eds));
    },
    [setEdgesState]
  );

  const updateNodes = (newNodes) => {
    setNodesState(newNodes);
    dispatch(setNodes(newNodes));
    dispatch(updateSpecification());
  };

  const updateEdges = (newEdges) => {
    setEdgesState(newEdges);
    dispatch(setEdges(newEdges));
    dispatch(updateSpecification());
  };

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateNodes,
    updateEdges
  };
};
