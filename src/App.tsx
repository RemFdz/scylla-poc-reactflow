import './App.css'
import {ReactFlow} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import {RefObject, useEffect, useRef, useState} from 'react';

function App() {
    const wsRef: RefObject<null | WebSocket> = useRef(null);
    const [isConnected, setConnected] = useState(false);


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

    const initialNodes = [
        { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
        { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
    ];
    const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

  return (
      <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%', height: '100%'}}>
          {isConnected ? <p style={{color: 'green'}}>Connected</p>: <p style={{color: 'red'}}>Disconnected</p>}
          <div style={{width: '75%', height: '75%', border: 'solid 1px black'}}>
                  <ReactFlow nodes={initialNodes} edges={initialEdges}/>
          </div>
      </div>
  )
}

export default App
