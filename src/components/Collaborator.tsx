import {useEffect, useRef, useState} from "react";

const CursorIcon = ({color} : {color: string}) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0,0,256,256">
            <g fill="none" fillRule="nonzero" stroke="none" strokeWidth="none" strokeLinecap="butt" strokeLinejoin="miter"
               strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none"
               fontSize="none" textAnchor="none">
                <g transform="scale(4,4)">
                    <path
                        d="M58.127,33.128l-40.5,-16.1c-0.513,-0.205 -1.095,0.044 -1.3,0.557c-0.095,0.239 -0.095,0.505 0,0.743l16.12,40.5c0.204,0.513 0.785,0.764 1.299,0.56c0.206,-0.082 0.379,-0.23 0.491,-0.42l6.73,-11.39c0.28,-0.476 0.893,-0.636 1.369,-0.356c0.073,0.043 0.141,0.095 0.201,0.156l13.3,13.34c0.781,0.781 2.047,0.782 2.828,0.002c0.001,-0.001 0.001,-0.001 0.002,-0.002l1.41,-1.41c0.781,-0.781 0.782,-2.047 0.002,-2.828c-0.001,-0.001 -0.001,-0.001 -0.002,-0.002l-13.34,-13.35c-0.391,-0.39 -0.391,-1.023 -0.001,-1.414c0.06,-0.06 0.128,-0.113 0.201,-0.156l11.33,-6.68c0.462,-0.302 0.592,-0.922 0.289,-1.384c-0.105,-0.161 -0.254,-0.288 -0.429,-0.366z"
                        fill={color} stroke="none" strokeWidth="1"></path>
                    <path
                        d="M17.547,21.398l38,15.09l2.7,-1.59c0.472,-0.288 0.621,-0.903 0.333,-1.374c-0.107,-0.175 -0.265,-0.313 -0.453,-0.396l-40.5,-16.1c-0.513,-0.205 -1.095,0.044 -1.3,0.557c-0.095,0.239 -0.095,0.505 0,0.743z"
                        fill="#ffffff" stroke="none" strokeWidth="1"></path>
                    <path
                        d="M60.077,56.478l-12.11,-12.1v0c-1.335,0.812 -1.76,2.553 -0.948,3.888c0.12,0.197 0.264,0.379 0.428,0.542l11.54,11.59l1.09,-1.09c0.781,-0.781 0.782,-2.047 0.002,-2.828c-0.001,-0.001 -0.002,-0.002 -0.002,-0.002z"
                        fill="#ffffff" stroke="none" strokeWidth="1"></path>
                    <path
                        d="M17.547,21.398l38,15.09l2.7,-1.59c0.472,-0.288 0.621,-0.903 0.333,-1.374c-0.107,-0.175 -0.265,-0.313 -0.453,-0.396l-40.5,-16.1c-0.513,-0.205 -1.095,0.044 -1.3,0.557c-0.095,0.239 -0.095,0.505 0,0.743z"
                        fill="#ffffff" stroke="none" strokeWidth="1"></path>
                    <path
                        d="M60.077,56.478l-12.11,-12.1v0c-1.335,0.812 -1.76,2.553 -0.948,3.888c0.12,0.197 0.264,0.379 0.428,0.542l11.54,11.59l1.09,-1.09c0.781,-0.781 0.782,-2.047 0.002,-2.828c-0.001,-0.001 -0.002,-0.002 -0.002,-0.002z"
                        fill="#ffffff" stroke="none" strokeWidth="1"></path>
                    <path
                        d="M47.447,34.238c0.552,0.001 1.001,-0.445 1.002,-0.998c0.001,-0.411 -0.25,-0.781 -0.632,-0.932l-14.7,-5.83c-0.514,-0.204 -1.096,0.046 -1.3,0.56c-0.204,0.514 0.046,1.096 0.56,1.3l14.66,5.79c0.127,0.065 0.267,0.103 0.41,0.11z"
                        fill={color} stroke="none" strokeWidth="1"></path>
                    <path
                        d="M29.017,24.868l-3.15,-1.25c-0.514,-0.204 -1.096,0.046 -1.3,0.56c-0.204,0.514 0.046,1.096 0.56,1.3l3.15,1.25c0.514,0.204 1.096,-0.046 1.3,-0.56c0.204,-0.514 -0.047,-1.096 -0.56,-1.3z"
                        fill={color} stroke="none" strokeWidth="1"></path>
                    <path
                        d="M58.127,33.128l-40.5,-16.1c-0.513,-0.205 -1.095,0.044 -1.3,0.557c-0.095,0.239 -0.095,0.505 0,0.743l16.12,40.5c0.204,0.513 0.785,0.764 1.299,0.56c0.206,-0.082 0.379,-0.23 0.491,-0.42l6.73,-11.39c0.28,-0.476 0.893,-0.636 1.369,-0.356c0.073,0.043 0.141,0.095 0.201,0.156l13.3,13.34c0.781,0.781 2.047,0.782 2.828,0.002c0.001,-0.001 0.001,-0.001 0.002,-0.002l1.41,-1.41c0.781,-0.781 0.782,-2.047 0.002,-2.828c-0.001,-0.001 -0.001,-0.001 -0.002,-0.002l-13.34,-13.35c-0.391,-0.39 -0.391,-1.023 -0.001,-1.414c0.06,-0.06 0.128,-0.113 0.201,-0.156l11.33,-6.68c0.462,-0.302 0.592,-0.922 0.289,-1.384c-0.105,-0.161 -0.254,-0.288 -0.429,-0.366z"
                        fill="none" stroke={color} strokeWidth="2"></path>
                </g>
            </g>
        </svg>
    )
}

const Collaborator = (props: { x: number, y: number, uuid: string }) => {
    const color = useRef<string | null>(null);
    const [pos, setPos] = useState<{x: number, y: number}>({x: 0, y: 0})

    const generateColorFromUUID = (uuid: string): string => {
        const hash = Array.from(uuid.replace(/-/g, '')).reduce((acc, char) => acc + char.charCodeAt(0), 0);

        const hue = hash % 360;
        return `hsl(${hue}, 80%, 60%)`;
    };

    useEffect(() => {
        if (color.current === null)
            color.current = generateColorFromUUID(props.uuid);
    }, [props.uuid]);

    useEffect(() => {
        setPos({x: props.x - 10, y: props.y - 10})
    }, [props.x, props.y]);

    return (

        <div
            style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                pointerEvents: 'none',
                zIndex: 10
            }}
        >
            <CursorIcon color={color.current ? color.current : ''}/>
        </div>
    )
}
export default Collaborator