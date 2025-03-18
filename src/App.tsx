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
import React, {RefObject, useCallback, useEffect, useRef, useState} from 'react';
import Sidebar from "./components/Sidebar.tsx";
import {useDnD} from "./providers/DndProvider.tsx";

import PrettyNode, { type PrettyNodeData } from './components/PrettyNode.tsx';


function App() {
    const wsRef: RefObject<null | WebSocket> = useRef(null);
    const [isConnected, setConnected] = useState(false);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node<PrettyNodeData>>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { screenToFlowPosition } = useReactFlow();
    const [type] = useDnD();

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

    const onNodeDrag = useCallback(
        (_event: React.MouseEvent, node: Node) => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                const updatedShape = { id: node.id, x: node.position.x, y: node.position.y, rotation: 0, isDragging: false, draggable: true };
                wsRef.current.send(JSON.stringify({type: 'update_shape', shape: updatedShape}));
            }
        },
        []
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

        ws.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            const position = { x: data.shape.x, y: data.shape.y };
            const id = data.shape.id;

            setNodes((nds) => {
                const exists = nds.some((node) => node.id === id);

                if (exists) {
                    return nds.map((node) =>
                        node.id === id ? { ...node, position } : node
                    );
                } else {
                    const newNode: Node<PrettyNodeData> = {
                        id,
                        position,
                        type: 'pretty',
                        data: { title: 'git clone' },
                    };

                    return nds.concat(newNode);
                }
            });
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

  return (
      <div className={"dndflow"} style={{display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%', height: '100%'}}>
          {isConnected ? <p style={{color: 'green'}}>Connected</p>: <p style={{color: 'red'}}>Disconnected</p>}
          <div style={{display: 'flex', flexDirection: 'row', width: '75%', height: '75%'}}>
              <div style={{width: '100%', height: '100%', border: 'solid 1px black'}}>
                  <ReactFlow
                      onDrop={onDrop}
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onDragOver={onDragOver}
                      onConnect={onConnect}
                      onNodeDrag={onNodeDrag}
                      nodeTypes={nodeTypes}
                      proOptions={{ hideAttribution: true }}
                      fitView
                  >
                      <Controls/>
                      <Background/>
                  </ReactFlow>
              </div>
              <Sidebar/>
          </div>
      </div>
  )
}

export default App
