import { useCallback } from 'react';
import { useNodesState, useEdgesState, addEdge } from 'reactflow';
import { useDispatch } from 'react-redux';
import { setNodes, setEdges, updateSpecification } from '@/redux/slices/flowSlice';

export const useFlow = () => {
  const dispatch = useDispatch();
  const [nodes, setNodesState, onNodesChange] = useNodesState([]);
  const [edges, setEdgesState, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge(params, edges);
      setEdgesState(newEdges);
    },
    [edges, setEdgesState]
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
