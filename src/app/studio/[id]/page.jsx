"use client";
import { Box, Tooltip } from "@mui/material";
import { useCallback, useState, useEffect, useRef } from "react";
import { ReactFlowProvider, useNodesState, useEdgesState, addEdge } from "reactflow";
import "reactflow/dist/style.css";
import { useNodeTypes } from "@/components/FlowNodes";
import ComponentsSidebar from "@/components/studio/ComponentsSidebar";
import JsonSpecView from "@/components/studio/JsonSpecView";
import FlowCanvas from "@/components/studio/FlowCanvas";
import { List } from "lucide-react";
import { useDispatch, useSelector, useStore } from "react-redux";
import SideDrawer from "@/components/Common/SideDrawer";
import {
    fetchTools,
    fetchAgents,
    fetchModels,
    getFlowById,
    updateFlow,
    setNodes,
    setEdges,
    deleteNode,
    updateNodeConnections,
    updateNode,
    runFlow,
    updateSpecification,
    getAllFlows,
    fetchMcpTools,
    clearNewFlowId,
} from "@/redux/slices/studioSlice";
import NodeDetailsModal from "@/components/studio/NodeDetailsModal";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import StudioChatBot from "@/components/studio/StudioChatBot";
import { getLastOutputParameter } from "@/utils/commonFunction";
import InputFieldConfiguration from "@/components/InputFieldConfiguration";
import VoiceConfigModal from "@/components/studio/VoiceConfigModal";
import StudioHeader from "@/components/studio/StudioHeader";
import FlowValidationModal from "@/components/studio/FlowValidationModal";
import { validateFlowOutputVariables } from "@/utils/flowValidation";
import {
    buildEdgesFromGraphSpec,
    buildNodesFromGraphSpec,
    getEdgeStrokeColor,
    FLOW_EDGE_TYPE,
} from "@/utils/flowLayout";
import { fingerprintCanvas } from "@/utils/flowFingerprint";
import ConfirmDialog from "@/components/Common/ConfirmDialog";

const Studio = () => {

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mainGridSize, setMainGridSize] = useState(9.5);
    const [prevGridSize, setPrevGridSize] = useState(9.5);
    const dispatch = useDispatch();
    const [nodes, setNodesState, onNodesChange] = useNodesState([]);
    const [edges, setEdgesState, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [nodeModalInitialTab, setNodeModalInitialTab] = useState(0);
    const [outputModalOpen, setOutputModalOpen] = useState(false);
    const [inputConfigOpen, setInputConfigOpen] = useState(false);
    // Unsaved-changes tracking. `savedFingerprintRef` holds the fingerprint of
    // the last persisted canvas; `isDirty` is derived from it in an effect so a
    // pure re-render can never flip it on its own.
    const [isDirty, setIsDirty] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);
    /**
     * Fingerprint of the canvas as it was last persisted. Compared against the
     * live canvas to derive `isDirty` — comparing structures instead of setting
     * a boolean from every mutation handler means undo-ing back to the saved
     * state correctly clears the flag again.
     */
    const savedFingerprintRef = useRef(null);
    const [formattedOututParam, setFormattedOututParam] = useState(null);
    const [toggleViewMode, setToggleViewMode] = useState(false);
    const [renderFlow, setRenderFlow] = useState(false);
    const [validationModalOpen, setValidationModalOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [skippedValidationIds, setSkippedValidationIds] = useState(() => new Set());
    const params = useParams();
    const flowId = params.id;
    const flow = useSelector(state => state.studio.flow);
    // NOTE: `studioLoader` / `flowOutput` are intentionally *not* subscribed to
    // here. They changed on every chat/stream tick and re-rendered the whole
    // studio page (canvas included) without being read anywhere.
    // `specification` is only ever read at save time, so we grab it from the
    // store imperatively instead of subscribing (it changes on every node edit).
    const store = useStore();
    const studioUpdateFlowLoader = useSelector(state => state.studio.studioUpdateFlowLoader);
    const isFlowRunning = useSelector(state => state.studio.isFlowRunning);
    const nodeTypes = useNodeTypes();

    // Refs are kept in sync inside an effect (never during render) so React's
    // concurrent renderer can safely discard a render pass.
    const nodesRef = useRef(nodes);
    const flowRef = useRef(flow);
    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);
    useEffect(() => {
        flowRef.current = flow;
    }, [flow]);

    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [voiceConfig, setVoiceConfig] = useState({
        tts_provider: "piper",
        stt_provider: "whisper",
        mode: "voice_in_voice_out"
    });
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await dispatch(getFlowById({ id: flowId })).unwrap();
                dispatch(fetchTools());
                dispatch(fetchModels());
                dispatch(fetchAgents());
                dispatch(getAllFlows());
                dispatch(fetchMcpTools());
                dispatch(clearNewFlowId());
            } catch (error) {
                console.error("Error fetching initial flow data:", error);
            }
        };
        fetchInitialData();
    }, [flowId, dispatch]);

    // graphSpec -> canvas. The (pure) layout maths lives in `@/utils/flowLayout`
    // so it is not re-created on every render of this component.
    useEffect(() => {
        if (!flow?.graphSpec?.nodes || !flow?.graphSpec?.edges) return;

        // Sync voice settings from flow if present
        if (flow?.voice_enabled !== undefined) setVoiceEnabled(flow.voice_enabled);
        if (flow?.voice_config) setVoiceConfig(flow.voice_config);

        const loadedNodes = buildNodesFromGraphSpec(flow.graphSpec);
        const loadedEdges = buildEdgesFromGraphSpec(flow.graphSpec);

        setNodesState(loadedNodes);
        setEdgesState(loadedEdges);

        // Anything the server just gave us is, by definition, saved.
        savedFingerprintRef.current = fingerprintCanvas(loadedNodes, loadedEdges);
        setIsDirty(false);

        if (renderFlow) {
            setRenderFlow(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flow?.graphSpec, renderFlow, setNodesState, setEdgesState]);


    useEffect(() => {
        if (renderFlow) {
            dispatch(getFlowById({ id: flowId }));
        }
    }, [renderFlow, flowId, dispatch]);


    const handleMinimizeSideBar = useCallback(() => {
        if (sidebarOpen) {
            setPrevGridSize(mainGridSize);
            setSidebarOpen(false);
            setMainGridSize(12);
        } else {
            setSidebarOpen(true);
            setMainGridSize(prevGridSize);
        }
    }, [sidebarOpen, mainGridSize, prevGridSize]);

    useEffect(() => {
        if (savedFingerprintRef.current === null) return;
        const current = fingerprintCanvas(nodes, edges);
        setIsDirty(current !== savedFingerprintRef.current);
    }, [nodes, edges]);

    // Native browser guard (tab close / refresh / external link). The custom
    // dialog below only covers in-app navigation.
    useEffect(() => {
        if (!isDirty) return undefined;
        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = "";
            return "";
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    const onConnect = useCallback(
        (params) => {
            const edge = {
                ...params,
                type: FLOW_EDGE_TYPE,
                style: { stroke: getEdgeStrokeColor(params.sourceHandle) },
            };

            setEdgesState((eds) => addEdge(edge, eds));

            dispatch(updateNodeConnections({
                source: params.source,
                target: params.target,
                sourceHandle: params.sourceHandle
            }));
        },
        [dispatch, setEdgesState]
    );

    /**
     * Creates a node from a sidebar/palette spec at an already projected flow
     * position. `connectFrom` is set when the node was created by dropping a
     * connection on empty canvas.
     */
    const handleAddSpecNode = useCallback(
        ({ spec, type, position, connectFrom }) => {
            if (!spec) {
                console.error("No node spec found in drop data");
                return;
            }

            if (type === "agentflow") {
                const flowInputs = spec?.inputs || [];

                if (flowInputs.length > 0) {
                    const incoming = flowInputs.map((input) => ({
                        ...input,
                        scope: input.scope === "global" ? "global" : "local",
                    }));
                    dispatch(updateSpecification({
                        inputs: [...(flowRef.current?.inputs || []), ...incoming],
                    }));
                }
            }

            const newNodeId = `${spec?.name}_node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            const newNode = {
                id: spec.type === "agentflow" ? spec.id : newNodeId,
                name: spec.name,
                key: newNodeId,
                type: spec.type,
                description: spec.description,
                interrupt: spec.interrupt || false,
                next: [],
                position,
                data: {
                    label: spec.name,
                    name: spec.name,
                    type: spec.type,
                    description: spec.description,
                    inputParameters: spec.inputParameters || [],
                    outputParameters: spec.type === 'agentflow' ? [{ key: "output", value: "", type: "text" }] : spec.outputParameters || [],
                    next: [],
                },
            };

            setNodesState((nds) => [...nds, newNode]);
            dispatch(setNodes({ nodes: [...nodesRef.current, newNode], flow: flowRef.current }));

            if (connectFrom?.source) {
                onConnect({
                    source: connectFrom.source,
                    sourceHandle: connectFrom.sourceHandle ?? null,
                    target: newNode.id,
                    targetHandle: null,
                });
            }
        },
        [dispatch, setNodesState, onConnect]
    );

    /** Adds already-built nodes (duplicate / paste) to the canvas + Redux. */
    const handleAddNodes = useCallback(
        (newNodes) => {
            if (!newNodes || newNodes.length === 0) return;
            setNodesState((nds) => [...nds, ...newNodes]);
            dispatch(setNodes({ nodes: [...nodesRef.current, ...newNodes], flow: flowRef.current }));
        },
        [dispatch, setNodesState]
    );

    const handleRenderFlow = useCallback(() => {
        setRenderFlow(prev => !prev);
    }, []);

    const handleOpenExecutionOutput = useCallback(() => {
        setOutputModalOpen(true);
    }, []);

    const syncTimeoutRef = useRef(null);
    const prevNodesLenRef = useRef(0);
    const prevEdgesLenRef = useRef(0);

    useEffect(() => {
        const nodesLen = nodes.length;
        const structuralChange = nodesLen !== prevNodesLenRef.current;
        prevNodesLenRef.current = nodesLen;

        if (structuralChange) {
            // Immediate sync for add/remove node
            dispatch(setNodes({ nodes: nodes, flow: flowRef.current }));
        } else {
            // Debounced sync for position-only changes (drag)
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = setTimeout(() => {
                dispatch(setNodes({ nodes: nodes, flow: flowRef.current }));
            }, 300);
        }

        return () => {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        };
    }, [nodes, dispatch]);

    const edgeSyncTimeoutRef = useRef(null);

    useEffect(() => {
        const edgesLen = edges.length;
        const structuralChange = edgesLen !== prevEdgesLenRef.current;
        prevEdgesLenRef.current = edgesLen;

        if (structuralChange) {
            // Immediate sync for add/remove edge
            dispatch(setEdges({ edges: edges, flow: flowRef.current }));
        } else {
            // Debounced sync for non-structural changes
            if (edgeSyncTimeoutRef.current) clearTimeout(edgeSyncTimeoutRef.current);
            edgeSyncTimeoutRef.current = setTimeout(() => {
                dispatch(setEdges({ edges: edges, flow: flowRef.current }));
            }, 300);
        }

        return () => {
            if (edgeSyncTimeoutRef.current) clearTimeout(edgeSyncTimeoutRef.current);
        };
    }, [edges, dispatch]);


    const handleToggleViewMode = useCallback(() => {
        setToggleViewMode(prev => !prev);
    }, []);

    const handleOpenOutputModal = useCallback((targetFlow) => {
        setOutputModalOpen(true);
        const lastParam = getLastOutputParameter(targetFlow);
        setFormattedOututParam(lastParam?.value);
    }, []);

    const nodesValidationRef = useRef(nodes);
    useEffect(() => {
        nodesValidationRef.current = nodes;
    }, [nodes]);

    const getValidationErrorId = useCallback((err) => {
        const occurrences = err?.occurrences?.map((occ) => `${occ.nodeId}:${occ.paramIndex}`).sort().join("|");
        return `${err?.type || "error"}:${err?.variableName || ""}:${occurrences || `${err?.nodeId}:${err?.paramIndex}`}`;
    }, []);

    // Reads the latest nodes through a ref so the identity of this callback (and
    // therefore of every handler depending on it) stays stable across renders.
    const runFlowValidation = useCallback(() => {
        const result = validateFlowOutputVariables(nodesValidationRef.current);
        const activeErrors = (result.errors || []).filter((err) => !skippedValidationIds.has(getValidationErrorId(err)));
        if (activeErrors.length > 0) {
            setValidationErrors(activeErrors);
            setValidationModalOpen(true);
            toast.error(`Validation Failed: ${activeErrors.length} output variable conflict(s) detected.`);
            return false;
        }
        return true;
    }, [getValidationErrorId, skippedValidationIds]);


    const handleUpdateFlowDetails = useCallback(({ name, description }) => {
        const currentSpec = store.getState().studio.specification || flowRef.current || {};
        const updatedSpec = {
            ...currentSpec,
            name,
            description,
            graphSpec: currentSpec.graphSpec || flowRef.current?.graphSpec || { nodes: [], edges: [] },
        };

        dispatch(updateSpecification({ name, description }));
        dispatch(updateFlow({
            id: flowId,
            updatedData: updatedSpec,
            onSuccess: () => {
                toast.success("Flow details updated.");
            },
        }));
    }, [dispatch, flowId, store]);

    const handleRunFlow = useCallback(() => {
        if (!runFlowValidation()) return;
        const currentFlow = flowRef.current;
        dispatch(runFlow({ data: { agent_id: currentFlow?.id }, onSuccess: () => handleOpenOutputModal(currentFlow) }));
    }, [dispatch, runFlowValidation, handleOpenOutputModal]);

    const handleDeployFlow = useCallback(() => {
        if (!runFlowValidation()) return;
        dispatch(updateSpecification());
        toast.success("Workflow deployed successfully.");
    }, [dispatch, runFlowValidation]);

    const onNodeClick = useCallback((event, node) => {
        setNodeModalInitialTab(0);
        setSelectedNode(node);
        setModalOpen(true);
    }, []);

    const handleOpenNodeDetails = useCallback((node) => {
        setNodeModalInitialTab(0);
        setSelectedNode(node);
        setModalOpen(true);
    }, []);

    const handleNodeDelete = useCallback((nodeId) => {
        setNodesState((nds) => nds.filter(node => node.id !== nodeId));
        setEdgesState((eds) => eds.filter(edge =>
            edge.source !== nodeId && edge.target !== nodeId
        ));
    }, [setNodesState, setEdgesState]);

    const handleDeleteNode = useCallback((node) => {
        if (node && node.id) {
            dispatch(deleteNode({ flow: flowRef.current, nodeId: node.id }));
            handleNodeDelete(node.id);
            setModalOpen(false);
            setSelectedNode(null);
        }
    }, [dispatch, handleNodeDelete]);

    const selectedNodeIdRef = useRef(null);
    useEffect(() => {
        selectedNodeIdRef.current = selectedNode?.id ?? null;
    }, [selectedNode]);

    /** Canvas-driven deletion (Del key, context menu, selection). */
    const handleNodesDeleted = useCallback((deletedNodes) => {
        if (!deletedNodes || deletedNodes.length === 0) return;
        deletedNodes.forEach((node) => {
            dispatch(deleteNode({ flow: flowRef.current, nodeId: node.id }));
        });
        setSelectedNode((current) =>
            current && deletedNodes.some((node) => node.id === current.id) ? null : current
        );
        setModalOpen((open) =>
            open && deletedNodes.some((node) => node.id === selectedNodeIdRef.current) ? false : open
        );
    }, [dispatch]);

    const handleEdgesDeleted = useCallback(() => {
        // Edge removal is already reflected in local state by React Flow; the
        // debounced `edges` effect above pushes the new list to Redux.
    }, []);

    // Refs so the save/navigation callbacks can read the latest canvas without
    // being re-created on every node drag.
    const nodesForSaveRef = useRef(nodes);
    const edgesForSaveRef = useRef(edges);
    useEffect(() => { nodesForSaveRef.current = nodes; }, [nodes]);
    useEffect(() => { edgesForSaveRef.current = edges; }, [edges]);

    const handleSaveFlow = useCallback((options = {}) => {
        if (!runFlowValidation()) return false;
        // Snapshot the fingerprint of exactly what is being sent, so edits made
        // while the request is in flight are still detected as unsaved.
        const savedSnapshot = fingerprintCanvas(nodesForSaveRef.current, edgesForSaveRef.current);
        dispatch(updateFlow({
            id: flowId,
            updatedData: store.getState().studio.specification,
            onSuccess: () => {
                savedFingerprintRef.current = savedSnapshot;
                setIsDirty(
                    fingerprintCanvas(nodesForSaveRef.current, edgesForSaveRef.current) !== savedSnapshot
                );
                toast.success("Workflow saved successfully");
                if (typeof options.onSaved === "function") options.onSaved();
            }
        }));
        return true;
    }, [dispatch, flowId, runFlowValidation, store]);

    /**
     * Item 2 — unsaved-changes guard.
     * Every in-app exit from the studio funnels through here: if the canvas
     * differs from the last persisted version we park the intent in
     * `pendingNavigation` and let the user save, discard, or stay.
     */
    const requestNavigation = useCallback((navigate) => {
        if (!isDirty) {
            navigate();
            return;
        }
        setPendingNavigation(() => navigate);
    }, [isDirty]);

    const handleCancelNavigation = useCallback(() => setPendingNavigation(null), []);

    const handleDiscardAndNavigate = useCallback(() => {
        const navigate = pendingNavigation;
        setPendingNavigation(null);
        setIsDirty(false);
        if (typeof navigate === "function") navigate();
    }, [pendingNavigation]);

    const handleSaveAndNavigate = useCallback(() => {
        const navigate = pendingNavigation;
        const started = handleSaveFlow({
            onSaved: () => {
                setPendingNavigation(null);
                if (typeof navigate === "function") navigate();
            }
        });
        // Validation failed – keep the dialog closed so the user can see the
        // validation modal that `runFlowValidation` just opened.
        if (!started) setPendingNavigation(null);
    }, [pendingNavigation, handleSaveFlow]);

    const handleFixNode = useCallback((nodeId, targetNode) => {
        setValidationModalOpen(false);
        const foundNode = targetNode || nodesValidationRef.current.find(n => n.id === nodeId);
        if (foundNode) {
            const nodeType = String(foundNode.type || foundNode.data?.type || "").toLowerCase();
            setNodeModalInitialTab(nodeType.startsWith("react_agent") ? 4 : 1);
            setSelectedNode(foundNode);
            setModalOpen(true);
        }
    }, []);

    const handleUpdateNodeParameters = useCallback((nodeId, updatedParameters, parameter) => {
        setNodesState((nds) => nds.map((node) => (
            node.id === nodeId
                ? { ...node, data: { ...node.data, [parameter]: updatedParameters } }
                : node
        )));
        setSelectedNode((current) => current?.id === nodeId
            ? { ...current, data: { ...current.data, [parameter]: updatedParameters } }
            : current
        );
        setIsDirty(true);
        dispatch(updateNode({ flow: flowRef.current, nodeId: nodeId, updatedNode: updatedParameters, parameter: parameter }));
    }, [dispatch, setNodesState]);

    const handleInputConfigSave = useCallback(() => {
        // Persistence + toast live in InputFieldConfiguration so we don't
        // double-notify when the dictionary is saved.
    }, []);

    const voiceConfigRef = useRef(voiceConfig);
    useEffect(() => {
        voiceConfigRef.current = voiceConfig;
    }, [voiceConfig]);

    const voiceEnabledRef = useRef(voiceEnabled);
    useEffect(() => {
        voiceEnabledRef.current = voiceEnabled;
    }, [voiceEnabled]);

    const handleVoiceToggle = useCallback(() => {
        setVoiceEnabled((prev) => {
            const newState = !prev;
            dispatch(updateSpecification({ voice_enabled: newState, voice_config: voiceConfigRef.current }));
            if (newState) setIsVoiceModalOpen(true);
            return newState;
        });
    }, [dispatch]);

    const handleVoiceConfigSave = useCallback((newConfig) => {
        setVoiceConfig(newConfig);
        dispatch(updateSpecification({ voice_enabled: voiceEnabledRef.current, voice_config: newConfig }));
    }, [dispatch]);

    const handleCloseNodeModal = useCallback(() => {
        setModalOpen(false);
        setSelectedNode(null);
    }, []);

    const handleCloseVoiceModal = useCallback(() => setIsVoiceModalOpen(false), []);
    const handleOpenVoiceModal = useCallback(() => setIsVoiceModalOpen(true), []);
    const handleCloseInputConfig = useCallback(() => setInputConfigOpen(false), []);
    const handleOpenInputConfig = useCallback(() => setInputConfigOpen(true), []);
    const handleSkipValidationError = useCallback((err) => {
        const id = getValidationErrorId(err);
        setSkippedValidationIds((prev) => new Set([...prev, id]));
        setValidationErrors((current) => {
            const next = current.filter((item) => getValidationErrorId(item) !== id);
            if (next.length === 0) setValidationModalOpen(false);
            return next;
        });
    }, [getValidationErrorId]);

    const handleSkipAllValidationErrors = useCallback(() => {
        setSkippedValidationIds((prev) => new Set([...prev, ...validationErrors.map(getValidationErrorId)]));
        setValidationModalOpen(false);
        toast.info("Skipped current output collision warnings for this session.");
    }, [validationErrors, getValidationErrorId]);

    const handleCloseValidationModal = useCallback(() => setValidationModalOpen(false), []);


    return (
        <>
            <div className="h-full w-full overflow-hidden flex flex-col bg-[#f8fafc]">
                <StudioChatBot
                    className='!z-100'
                    opened={true}
                    flow={flow}
                    handleRenderFlow={handleRenderFlow}
                    voiceEnabled={voiceEnabled}
                    voiceConfig={voiceConfig}
                />
                <VoiceConfigModal
                    isOpen={isVoiceModalOpen}
                    onClose={handleCloseVoiceModal}
                    config={voiceConfig}
                    onSave={handleVoiceConfigSave}
                />
                {inputConfigOpen && (
                    <InputFieldConfiguration
                        open={inputConfigOpen}
                        onClose={handleCloseInputConfig}
                        onSave={handleInputConfigSave}
                    />
                )}

                {/* Unified Enterprise Studio Top Header */}
                <StudioHeader
                    flow={flow}
                    flowId={flowId}
                    toggleViewMode={toggleViewMode}
                    onToggleViewMode={handleToggleViewMode}
                    voiceEnabled={voiceEnabled}
                    onVoiceToggle={handleVoiceToggle}
                    onVoiceSettingsClick={handleOpenVoiceModal}
                    onConfigureInputsClick={handleOpenInputConfig}
                    onRunFlow={handleRunFlow}
                    isFlowRunning={isFlowRunning}
                    onSaveFlow={handleSaveFlow}
                    isSavingFlow={studioUpdateFlowLoader}
                    onDeployFlow={handleDeployFlow}
                    isDirty={isDirty}
                    onRequestNavigate={requestNavigation}
                    onUpdateFlowDetails={handleUpdateFlowDetails}
                />

                {/* Unsaved-changes guard for in-app navigation out of the studio */}
                <ConfirmDialog
                    open={Boolean(pendingNavigation)}
                    tone="warning"
                    title="Leave without saving?"
                    description="This workflow has changes that haven't been saved yet. If you leave now, those changes will be lost."
                    confirmLabel="Discard changes"
                    secondaryLabel="Save & leave"
                    cancelLabel="Stay here"
                    busy={studioUpdateFlowLoader}
                    onConfirm={handleDiscardAndNavigate}
                    onSecondary={handleSaveAndNavigate}
                    onCancel={handleCancelNavigation}
                />

                {/* Studio Main Workspace (Sidebar + Canvas) */}
                <Box className="flex-1 flex overflow-hidden relative">
                    {sidebarOpen ? (
                        <Box className="w-[280px] h-full shrink-0 transition-all duration-200 ease-in-out border-r border-slate-200/80">
                            <ComponentsSidebar
                                minimizeSideBar={!sidebarOpen}
                                handleMinimizeSideBar={handleMinimizeSideBar}
                            />
                        </Box>
                    ) : (
                        <Box className="absolute top-3 left-3 z-20">
                            <Tooltip title="Expand Components Panel">
                                <button
                                    onClick={handleMinimizeSideBar}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <List size={14} /> Components
                                </button>
                            </Tooltip>
                        </Box>
                    )}

                    <Box className="flex-1 h-full overflow-hidden relative bg-[#f8fafc]">
                        {!toggleViewMode ? (
                            <div className="h-full w-full">
                                <FlowCanvas
                                    flowId={flowId}
                                    nodes={nodes}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    nodeTypes={nodeTypes}
                                    onConnect={onConnect}
                                    onNodeClick={onNodeClick}
                                    onNodesDeleted={handleNodesDeleted}
                                    onEdgesDeleted={handleEdgesDeleted}
                                    onAddSpecNode={handleAddSpecNode}
                                    onAddNodes={handleAddNodes}
                                    onOpenNodeDetails={handleOpenNodeDetails}
                                    sidebarCollapsed={!sidebarOpen}
                                />
                            </div>
                        ) : (
                            <div className="h-full overflow-auto p-4">
                                <JsonSpecView />
                            </div>
                        )}

                        <SideDrawer />
                        <NodeDetailsModal
                            flowId={flow?.id}
                            open={modalOpen}
                            onClose={handleCloseNodeModal}
                            node={selectedNode}
                            onDelete={handleDeleteNode}
                            onUpdateParameters={handleUpdateNodeParameters}
                            sections={{
                                displayBasicInformation: true,
                                displayInputParameters: !!selectedNode?.data?.inputParameters?.length > 0,
                                displayOutputParameters: !!selectedNode?.data?.outputParameters?.length > 0,
                            }}
                            flow={flow}
                            onOpenExecutionOutput={handleOpenExecutionOutput}
                            initialActiveTab={nodeModalInitialTab}
                        />

                        {/* Flow Validation Collision Modal */}
                        <FlowValidationModal
                            open={validationModalOpen}
                            onClose={handleCloseValidationModal}
                            errors={validationErrors}
                            onFixNode={handleFixNode}
                            allowSkip
                            onSkipError={handleSkipValidationError}
                            onSkipAll={handleSkipAllValidationErrors}
                        />
                    </Box>
                </Box>
            </div>
        </>
    );
};

export default function StudioPage() {
    // The provider must sit *above* the component that calls `useReactFlow()` /
    // `useStore()`, otherwise the hooks resolve to a throwaway store.
    return (
        <ReactFlowProvider>
            <Studio />
        </ReactFlowProvider>
    );
}
