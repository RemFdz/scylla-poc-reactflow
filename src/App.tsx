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
import React, { RefObject, useCallback, useEffect, useRef, useState} from 'react';
import Sidebar from "./components/Sidebar.tsx";
import {useDnD} from "./providers/DndProvider.tsx";

import PrettyNode, { type PrettyNodeData } from './components/PrettyNode.tsx';
import Collaborator from "./components/Collaborator.tsx";


function App() {
    const wsRef: RefObject<null | WebSocket> = useRef(null);
    const [isConnected, setConnected] = useState(false);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node<PrettyNodeData>>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { screenToFlowPosition, flowToScreenPosition } = useReactFlow();
    const [type] = useDnD();
    const [collaborators, setCollaborators] = useState(new Map<string, {x: number, y: number}>)
    const reactFlowWrapper = useRef<HTMLDivElement | null>(null);

    const onConnect = useCallback(
        (params: Connection): void => {
            setEdges((prevEdges: Edge[]) => addEdge(params, prevEdges));
        },
        [setEdges]
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
        ws.onclose = () => console.log('WS connection closed');

        //TODO: the server should give the type and we should have a map of data (like title depending on the type)
        ws.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);

            if (!data || !data.type)
                return;

            if (data.type === 'update_shape' || data.type === 'create_shape') {
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
                            data: {title: 'Git clone'},
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
                    setCollaborators(new Map(collaborators.set(conn_id, adjustedPos)));
                }
            }
        };

        return () => {
            if (wsRef.current && isConnected) {
                wsRef.current.close()
                wsRef.current = null;
            }
        }
    });

    const nodeTypes = {
        pretty: PrettyNode,
    };

    const onMove = useCallback((event: MouseEvent | TouchEvent | null) => {
        if (event && event instanceof MouseEvent) {
            onMouseMove(event as unknown as React.MouseEvent);
        }
    }, [onMouseMove])

  return (
      <div className={"dndflow"} style={{display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%', height: '100%'}}>
          {isConnected ? <p style={{color: 'green'}}>Connected</p>: <p style={{color: 'red'}}>Disconnected</p>}
          <div style={{display: 'flex', flexDirection: 'row', width: '75%', height: '75%'}}>
              <div ref={reactFlowWrapper} style={{width: '100%', height: '100%', border: 'solid 1px black', cursor: 'none', overflow: 'hidden'}}>
                  <ReactFlow
                      onDrop={onDrop}
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onDragOver={onDragOver}
                      onConnect={onConnect}
                      onNodeDrag={onNodeDrag}
                      onMouseMove={onMouseMove}
                      onMove={onMove}
                      nodeTypes={nodeTypes}
                      proOptions={{ hideAttribution: true }}
                      fitView
                  >
                      <Controls/>
                      <Background/>
                      {Array.from(collaborators).map(([, pos], index) => (
                          <Collaborator key={index} x={pos.x} y={pos.y} />
                      ))}
                  </ReactFlow>
              </div>
              <Sidebar/>
          </div>
      </div>
  )
}

export default App
