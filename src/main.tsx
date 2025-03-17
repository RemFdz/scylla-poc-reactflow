import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {DnDProvider} from "./providers/DndProvider.tsx";
import {ReactFlowProvider} from "@xyflow/react";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <DnDProvider>
          <ReactFlowProvider>
            <App />
          </ReactFlowProvider>
      </DnDProvider>
  </StrictMode>,
)
