import { type Node } from "@xyflow/react";
import { PrettyNodeData } from "./PrettyNode.tsx";
import { Button } from 'antd';
import { useState } from "react";

const NodeInfo = ({ nodeData, displayed, onClose }: {nodeData: Node<PrettyNodeData>, displayed: boolean, onClose: Function}) => {

    return (
        <>
            {displayed ?
                <div style={
                    {
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "start",
                        alignItems: "flex-start",
                        border: "3px solid #38A3A5",
                        borderRadius: "10px",
                        minHeight: "330px",
                        minWidth: "250px",
                        width: "25%",
                        height: "50%",
                        backgroundColor: "white",
                        position: "absolute",
                        left: "70%",
                        top: "20%",
                        zIndex: "10",
                        boxShadow: "0px 12px 12px 6px rgba(0, 0, 0, 0.2)"
                    }
                }>
                    <h1 style={{marginLeft: "20px"}}>{nodeData.data.title}</h1>
                    <div className={"state-label"}><p>Running</p></div>
                    <h3 className={"section-label"}>Description</h3>
                    <div style={{display: "flex", justifyContent: "center", width: "100%", height: "20%"}}>
                        <div className={"description-container"}>
                            <p className={"description"}>{nodeData.data.description}</p>
                        </div>
                    </div>
                    <h3 className={"section-label"}>Code</h3>
                    <div style={{display: "flex", justifyContent: "center", width: "100%", height: "10%"}}>
                        <div className={"code-container"}>
                            <code className={"code-text"}>{nodeData.data.code}</code>
                        </div>
                    </div>
                    <div style={{display: "flex", justifyContent: "center", width: "100%", margin: '5px'}}>
                        <Button onClick={() => onClose()} color="danger" variant="dashed">Close</Button>
                    </div>
                </div>
            : null }
        </>
    )
}

export default NodeInfo;