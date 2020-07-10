import React, { useRef } from "react"
import styled from "styled-components"
import { observer } from "mobx-react"
import { types, applyPatch, getSnapshot } from "mobx-state-tree"

const PlaceCircle = styled.circle`
  &:hover {
      stroke: blue;
      stroke-width: 4px;
  }
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
    anchor: types.maybe(types.reference(types.late(() => Place))),
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
            applyPatch(model, {
                op: "remove",
                path: self.$treenode.path,
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

const Model = types.model({
    cursor: Place,
    screenCorner: Place,
    nodes: types.array(Node),
})

const model = Model.create({
    cursor: { x: 0, y: 0, },
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
                    path: "/cursor",
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
                    value: getSnapshot(model.cursor),
                })
            }}
        >
            {model.nodes.map((node) => node.render)}

            <circle
                cx={model.cursor.x}
                cy={model.cursor.y}
                r={10}
                stroke="red"
                fill="none"
            />
            





            {/* <path
              stroke="none"
              fill="none"
              id="line"
              d={`
              M 100 ${size_y - dy}
              L 100 ${2 * dy}
              Q ${0 + dx} ${0 + dy} ${2 * dx} ${0 + dy}
              L 800 100
              Q 900 100 900 200
              L 900 900
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