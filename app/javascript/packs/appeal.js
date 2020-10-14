import React, { useRef } from "react"
import styled from "styled-components"
import { observer } from "mobx-react"
import { types, applyPatch, getSnapshot } from "mobx-state-tree"

const PlaceCircle = styled.circle`
  &:hover {
      stroke: grey;
      stroke-width: 4px;
  }

  stroke: ${p => p.grabbed ? "blue" : "none"};
`

const Display = styled.div`
display: grid;
grid-template-columns: 25% 1fr;
grid-template-rows: 4rem 1fr;
grid-gap: 1rem;
padding: 2rem;
height: calc(100vh - 4rem);
width: calc(100vw - 4rem);
`

const Area = styled.svg`
  border: 1px solid black;
  grid-area: 2 / 2;
  height: 100%;
  width: 100%;
`

const Graph = styled.div`
grid-area: 2 / 1;
border: 1px solid blue;
padding: 0.5rem;
`

const GraphNode = styled.div`
&:nth-child(2n) {
    background: lightgrey;
}
`

const Place = types.model("Place", {
    x: 0,
    y: 0,
    key: types.identifier,
}).views(self => ({
    get render() { return (
        <PlaceCircle
        key={self.$treenode.path}
        cx={self.x}
        cy={self.y}
        r={10}
        onClick={(e) => {
            // debugger
            e.stopPropagation()
            // applyPatch(model, {
            //     op: "remove",
            //     path: self.$treenode.path,
            // })
            debugger
            applyPatch(model, {
                op: "add",
                path: "/cursor/grabbed/-",
                value: getSnapshot(self),
            })
        }}
        />
    )},

    get graph() { return (
        <GraphNode key={self.$treenode.path}>
            {self.$treenode.type.name}: ({Math.floor(self.x)},{Math.floor(self.y)})
        </GraphNode>
    )}
}))

const Line = types.model("Line", {
    begin: Place,
    end: Place,

    bulk: 2,
    key: types.identifier,
}).views(self => ({
    get render() { return (
        <path
            key={self.$treenode.path}
            stroke="black"
            strokeWidth={self.bulk}
            d={`M ${self.begin.x} ${self.begin.y} L ${self.end.x} ${self.end.y}`}
        />
    )},

    get graph() { return (
        <GraphNode key={self.$treenode.path}>
            {self.$treenode.type.name}: ({self.begin.x},{self.begin.y}) - ({self.end.x},{self.end.y})
        </GraphNode>
    )}
}))

const Node = types.union(
    Line,
    Place,
)

const Cursor = types.model("Cursor", {
    place: Place,
    grabbed: types.array(types.reference(Node)),
}).views(self => ({
    get render() { return (
        <circle
            cx={self.place.x}
            cy={self.place.y}
            r={10}
            stroke="red"
            fill="none"
        />
    )}
}))

const Model = types.model({
    cursor: Cursor,
    screenCorner: Place,
    nodes: types.array(Node),
})

const model = Model.create({
    cursor: { place: { x: 0, y: 0, }, grabbed: [] },
    screenCorner: { x: window.innerWidth, y: innerHeight, },
    nodes: [
        { begin: { x: 20, y: 40, }, end: { x: 100, y: 100, }}
    ],
})

window.model = model

window.onresize = () => {
    applyPatch(model, {
        op: "replace",
        path: "/screenCorner",
        value: { x: window.innerWidth, y: innerHeight, }
    })
}

const Appeal = observer(() => {
    var area = useRef()

    var dx = 100
    var dy = 100
    var size_x = 1000
    var size_y = 1000

    return (
    <Display>
        <Graph>
            {model.nodes.map(node => ( node.graph ))}
        </Graph>

        <Area
            ref={area}
        // style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            // height="100%"
            // width="100%"
            // viewBox={`0 0 ${model.screenCorner.x} ${model.screenCorner.y}`}
            onMouseMove={(e) => {
                let boundary = area.current.getBoundingClientRect()
                applyPatch(model, {
                    op: "replace",
                    path: "/cursor/place",
                    value: {
                        x: e.clientX - boundary.x || 0,
                        y: e.clientY - boundary.y || 0,
                    }
                })
            }}
            onClick={() => {
                applyPatch(model, {
                    op: "add",
                    path: "/nodes/-",
                    value: getSnapshot(model.cursor.place),
                })
            }}
        >
            {model.nodes.map((node) => node.render)}
            {model.cursor.render}
            





            {/* <path
              stroke="none"
              fill="none"
              id="line"
              d={`
              M ${dx} ${size_y - dy}
              L ${dx} ${2 * dy}
              Q ${dx} ${dy} ${2 * dx} ${dy}
              L ${size_x - 2 * dx} ${dy}
              Q ${size_x - dx} ${dy} ${size_x - dx} ${2 * dy}
              L ${size_x - dx} ${size_y - dy}
              `}
              />
            <text width="1000" fontSize="2.4em">
                <textPath href="#line" >
                    i occasionally recall us each is grasping on
                    an enormous sphere's skin,
                    cycling endlessly in a meaningless expanse,
                    and really big clouds help me cope.
                </textPath>
            </text> */}
        </Area>
    </Display>
    )
})

export default Appeal