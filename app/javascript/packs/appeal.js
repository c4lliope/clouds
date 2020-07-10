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
    var upload = useRef()

    var dx = 100
    var dy = 100
    var size_x = 1000
    var size_y = 1000

    return (
    <div>
        <svg
        // style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            // height="100vh"
            // width="100%"
            height={`${model.screenCorner.y}`}
            width={`${model.screenCorner.x}`}
            viewBox={`0 0 ${model.screenCorner.x} ${model.screenCorner.y}`}
            onMouseMove={(e) => {
                let svg = e.target
                // debugger;
                applyPatch(model, {
                    op: "replace",
                    path: "/cursor",
                    value: {
                        x: e.clientX  || 0,
                        y: e.clientY || 0,
                    }
                })
                // console.log(model.cursor.x, model.cursor.y)
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
        </svg>
    </div>
    )
})

export default Appeal