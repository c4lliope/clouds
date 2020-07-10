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

const Place = types.model({
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
    )}
}))

const Model = types.model({
    places: types.array(Place),
    cursor: Place,
    screenCorner: Place,
})

const model = Model.create({
    places: [],
    cursor: { x: 0, y: 0, },
    screenCorner: { x: window.innerWidth, y: innerHeight, },
})

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
                    path: "/places/-",
                    value: getSnapshot(model.cursor),
                })
            }}
        >
            {model.places.map((place) => place.render )}

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