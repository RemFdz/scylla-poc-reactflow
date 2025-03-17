import './App.css'
import {Controls, ReactFlow, useEdgesState, useNodesState, useReactFlow} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import React, {RefObject, useCallback, useEffect, useRef, useState} from 'react';
import Sidebar from "./components/Sidebar.tsx";
import {useDnD} from "./providers/DndProvider.tsx";

type Node = {
  id: string;
  position: {
      x: number;
      y: number;
  }
  data: {
      label: string;
  }
}

function App() {
    let id = 0;
    const getId = () => `dndnode_${id++}`;

    const wsRef: RefObject<null | WebSocket> = useRef(null);
    const [isConnected, setConnected] = useState(false);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, , onEdgesChange] = useEdgesState([]);
    const { screenToFlowPosition } = useReactFlow();
    const [type] = useDnD();


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
            const newNode = {
                id: getId(),
                type,
                position,
                data: { label: `${type}` },
                style: {height: 40, width: 70}
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, type],
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

        return () => {
            if (wsRef.current && isConnected) {
                wsRef.current.close()
                wsRef.current = null;
            }
        }
    });

  return (
      <div className={"dndflow"} style={{display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%', height: '100%'}}>
          {isConnected ? <p style={{color: 'green'}}>Connected</p>: <p style={{color: 'red'}}>Disconnected</p>}
          <div style={{display: 'flex', flexDirection: 'row', width: '100%', height: '100%'}}>
              <div style={{width: '75%', height: '75%', border: 'solid 1px black'}}>
                      <ReactFlow
                          onDrop={onDrop}
                          nodes={nodes}
                          edges={edges}
                          onNodesChange={onNodesChange}
                          onEdgesChange={onEdgesChange}
                          onDragOver={onDragOver}
                      >
                          <Controls/>
                      </ReactFlow>
              </div>
              <Sidebar/>
          </div>
      </div>
  )
}

export default App
