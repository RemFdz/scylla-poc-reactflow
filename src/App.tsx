import './App.css'
import {
    addEdge,
    Background,
    Connection,
    Controls,
    Edge,
    type Node,
    ReactFlow,
    useEdgesState,
    useNodesState,
    useReactFlow
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import React, {RefObject, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Sidebar from "./components/Sidebar.tsx";
import {useDnD} from "./providers/DndProvider.tsx";

import PrettyNode, {type PrettyNodeData} from './components/PrettyNode.tsx';
import Collaborator from "./components/Collaborator.tsx";
import debounce from 'lodash.debounce';
import NodeInfo from "./components/NodeInfo.tsx";

function App() {
    const wsRef: RefObject<null | WebSocket> = useRef(null);
    const [isConnected, setConnected] = useState(false);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node<PrettyNodeData>>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { screenToFlowPosition, flowToScreenPosition } = useReactFlow();
    const [nodeData, setNodeData] = useState<Node<PrettyNodeData>| null>(null);
    const [type] = useDnD();

    const [collaborators, setCollaborators] = useState<Record<string, { x: number, y: number }>>({});
    const reactFlowWrapper = useRef<HTMLDivElement | null>(null);

    const onConnect = useCallback(
        (params: Connection): void => {
            if (wsRef.current)
                wsRef.current.send(JSON.stringify({type: "create_edge", edge_info: {
                    source: params.source,
                    source_handle: params.sourceHandle,
                    target: params.target,
                    target_handle: params.targetHandle
                }}));
        },
        []
    );

    const onDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();

            if (!type) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            if (wsRef.current)
                wsRef.current.send(JSON.stringify({ type: 'create_shape', shape: {x: position.x, y: position.y, draggable: true, isDragging: false, rotation: 0}}));
        },
        [screenToFlowPosition, type],
    );

    const onMouseMove = useCallback((event: React.MouseEvent) => {
        const canvas_position = screenToFlowPosition({x: event.clientX, y: event.clientY});
        if (wsRef.current && isConnected) {
            wsRef.current.send(JSON.stringify({type: 'update_mouse', mouse_info: {x: canvas_position.x, y: canvas_position.y}}));
        }
    }, [isConnected, screenToFlowPosition]);

    const onNodeDrag = useCallback(
        (_event: React.MouseEvent, node: Node) => {
            onMouseMove(_event);
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                const updatedShape = { id: node.id, x: node.position.x, y: node.position.y, rotation: 0, isDragging: true, draggable: true };
                wsRef.current.send(JSON.stringify({type: 'update_shape', shape: updatedShape}));
            }
        },
        [onMouseMove]
    );

    const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const debouncedSetCollaborators = useMemo(() =>
        debounce((conn_id: number, adjustedPos: {x: number, y: number}) => {
            setCollaborators(prev => ({
                ...prev,
                [conn_id]: adjustedPos,
            }));
        }, 1), []);

    //TODO: refactor this function into a handler's map of key type string and value function to improve readability
    const handleServerMessage = useCallback((event: MessageEvent) => {
        const data = JSON.parse(event.data);

        if (data.type === 'update_shape' || data.type == 'create_shape') {
            const position = {x: data.shape.x, y: data.shape.y};
            const id = data.shape.id;

            setNodes((nds) => {
                const exists = nds.some((node) => node.id === id);

                if (exists) {
                    return nds.map((node) =>
                        node.id === id ? {...node, position} : node
                    );
                } else {
                    const newNode: Node<PrettyNodeData> = {
                        id,
                        position,
                        type: 'pretty',
                        data: {title: 'Git clone', description: 'Clone a git repository', code: "git clone [repository_url]"}
                    };

                    return nds.concat(newNode);
                }
            });
        }

        if (data.type === 'update_mouse') {
            if (reactFlowWrapper.current) {
                const bounds = reactFlowWrapper.current.getBoundingClientRect();
                const position = flowToScreenPosition({x: data.mouse_info.x, y: data.mouse_info.y});
                const adjustedPos = {x: position.x - bounds.x, y: position.y - bounds.y}
                const conn_id = data.mouse_info.conn_id;
                if (!conn_id || ! position)
                    return;
                debouncedSetCollaborators(conn_id, adjustedPos);
            }
        }

        if (data.type === 'create_edge') {
            if (!data.edge_info)
                return;
            const params: Connection =  {
                source: data.edge_info.source,
                sourceHandle: data.edge_info.source_handle,
                target: data.edge_info.target,
                targetHandle: data.edge_info.target_handle
            }
            setEdges((prevEdges: Edge[]) => addEdge(params, prevEdges));

        }

        if (data.type === 'disconnect') {
            setCollaborators(prev => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [data.mouse_info.conn_id]: _, ...rest } = prev;
                return rest;
            });
        }
    }, [debouncedSetCollaborators, flowToScreenPosition, setNodes])


    useEffect(() => {
        if (wsRef.current)
            return;
        const ws = new WebSocket('ws://localhost:8080/ws');
        wsRef.current = ws;
        ws.onopen = () => {
            console.log('WS connected to the server');
            setConnected(true);
        }
        ws.onerror = (e) => console.error('WS error: ', e);
        ws.onclose = () => {
            setConnected(false);
            wsRef.current = null;
            console.log('WS connection closed');
        };
        ws.onmessage = handleServerMessage;

        return () => {
            if (wsRef.current && isConnected) {
                wsRef.current.close()
                wsRef.current = null;
            }
        }
    }, [handleServerMessage, isConnected]);

    const nodeTypes = {
        pretty: PrettyNode,
    };

    const onMove = useCallback((event: MouseEvent | TouchEvent | null) => {
        if (event && event instanceof MouseEvent) {
            onMouseMove(event as unknown as React.MouseEvent);
        }
    }, [onMouseMove])

    const onNodeClick = (_: React.MouseEvent, node: Node<PrettyNodeData>) => {
        setNodeData(node);
    };

  return (
      <div className={"dndflow"} style={{display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%', height: '100%'}}>
          {isConnected ? <p style={{color: 'green'}}>Connected</p>: <p style={{color: 'red'}}>Disconnected</p>}
          <div style={{display: 'flex', flexDirection: 'row', width: '75%', height: '75%'}}>
              <div ref={reactFlowWrapper} style={{width: '100%', height: '100%', border: 'solid 1px black', overflow: 'hidden'}}>
                  <ReactFlow
                      className={"react-flow__renderer"}
                      onDrop={onDrop}
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onDragOver={onDragOver}
                      onConnect={onConnect}
                      onNodeDrag={onNodeDrag}
                      onMouseMove={onMouseMove}
                      onNodeDoubleClick={onNodeClick}
                      onPaneClick={() => setNodeData(null)}
                      onMove={onMove}
                      nodeTypes={nodeTypes}
                      proOptions={{ hideAttribution: true }}
                      fitView
                  >
                      <Controls/>
                      <Background/>
                      {Object.entries(collaborators).map(([uuid, pos]) => (
                          <Collaborator key={uuid} x={pos.x} y={pos.y} uuid={uuid} />
                      ))}
                      {nodeData !== null ? <NodeInfo nodeData={ nodeData }/> : <></>}
                  </ReactFlow>
              </div>
              <Sidebar/>
          </div>
      </div>
  )
}

export default App
