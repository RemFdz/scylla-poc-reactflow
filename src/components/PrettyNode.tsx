import { memo } from 'react';

import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';

export type PrettyNodeData = {
    title: string;
};

const GitIcon = ({ size = 64 }: { size?: number }) => {
    return (
    <svg width={size} height={size} viewBox="0 0 64 70" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M44.9641 66.6555V54.0132C45.4038 50.054 44.2685 46.0806 41.8035 42.9513C51.2852 42.9513 60.7669 36.6302 60.7669 25.5682C61.0197 21.6175 59.9135 17.7301 57.6063 14.5063C58.4913 10.8716 58.4913 7.07898 57.6063 3.44434C57.6063 3.44434 54.4457 3.44434 48.1246 8.18517C39.7808 6.60489 31.184 6.60489 22.8402 8.18517C16.5191 3.44434 13.3585 3.44434 13.3585 3.44434C12.4103 7.07898 12.4103 10.8716 13.3585 14.5063C11.0572 17.717 9.94027 21.6263 10.1979 25.5682C10.1979 36.6302 19.6796 42.9513 29.1613 42.9513C27.9287 44.5 27.0121 46.2699 26.4748 48.1662C25.9375 50.0625 25.7795 52.0537 26.0007 54.0132M26.0007 54.0132V66.6555M26.0007 54.0132C11.7466 60.3344 10.1978 47.6921 3.87671 47.6921"
            stroke="#020617" stroke-width="6.32111" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    )
}

const PrettyNode =  memo(({data}: NodeProps<Node<PrettyNodeData>>) => {
    return (
        <>
            <div className="wrapper gradient">
                <div className="inner">
                    <div className="body">
                        <div>
                            <GitIcon size={33}/>
                        </div>
                    </div>
                    <Handle type="target" position={Position.Left}/>
                    <Handle type="source" position={Position.Right}/>
                </div>
            </div>
            <div className="title">{data.title}</div>
        </>
    );
});

export default PrettyNode;