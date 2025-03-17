import {useDnD} from "../providers/DndProvider.tsx";
import React from "react";

const Sidebar = () => {
    const [, setType] = useDnD();

    const onDragStart = (event:  React.DragEvent<HTMLDivElement>, nodeType: string) => {
        setType(nodeType);
        if (event && event.dataTransfer)
            event.dataTransfer.effectAllowed = 'move';
    };


    return (
        <aside>
            <div className="description">You can drag these nodes to the pane on the right.</div>
            <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'git clone')} draggable>
                Git clone
            </div>
        </aside>
    );
}

export default Sidebar;