import {useDnD} from "../providers/DndProvider.tsx";
import React from "react";
import {GitIcon} from "./PrettyNode.tsx";

const Sidebar = () => {
    const [, setType] = useDnD();

    const onDragStart = (event:  React.DragEvent<HTMLDivElement>, nodeType: string) => {
        setType(nodeType);
        if (event && event.dataTransfer)
            event.dataTransfer.effectAllowed = 'move';
    };


    return (
        <aside>
            <div className="description">You can drag these nodes in the workflow on the left.</div>
            <div>
                <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'gitclone')} draggable>
                    <GitIcon size={30}></GitIcon>
                </div>
                <p className="dndnode-label">Git clone</p>
            </div>
            <div>
                <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'gitstatus')} draggable>
                    <GitIcon size={30}></GitIcon>
                </div>
                <p className="dndnode-label">Git status</p>
            </div>
        </aside>
    );
}

export default Sidebar;