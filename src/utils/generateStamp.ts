import { Geom3 } from "@jscad/modeling/src/geometries/types"
import { Vec2, Vec3 } from "@jscad/modeling/src/maths/types"
import {
  intersect,
  subtract,
  union,
} from "@jscad/modeling/src/operations/booleans"
import { extrudeRotate } from "@jscad/modeling/src/operations/extrusions"
import { rotate, translate } from "@jscad/modeling/src/operations/transforms"
import { cuboid, polygon, polyhedron } from "@jscad/modeling/src/primitives"
import {
  getDefaultStampOptions,
  StampOptions,
} from "functions/defaultStampOptions"

const pyramid = ({ size }: { size: Vec3 }) => {
  const width = size[0]
  const depth = size[1]
  const height = size[2]

  return translate(
    [-width / 2, -depth / 2, 0],
    // thx copilot
    polyhedron({
      orientation: "inward",
      points: [
        [0, 0, 0],
        [width, 0, 0],
        [width, depth, 0],
        [0, depth, 0],
        [width / 2, depth / 2, height],
      ],
      faces: [
        [0, 1, 2, 3],
        [0, 4, 1],
        [1, 4, 2],
        [2, 4, 3],
        [3, 4, 0],
      ],
    })
  )
}

export const generateHandle = (options?: StampOptions) => {
  const stampOptions = getDefaultStampOptions(options ?? {})
  const {
    interfaceHeight,
    stampHeight,
    handleRadius,
    handleExponent,
    interfaceWidth,
    interfaceDepth,
    baseBevel,
    width,
    depth,
    pyramidOversize,
  } = stampOptions

  const basePyramidHeight = Math.min(
    Math.max(interfaceDepth - baseBevel, interfaceWidth - baseBevel),
    stampHeight * 0.3
  )

  const point = 1 - handleRadius / stampHeight

  const handleTop = extrudeRotate(
    {},
    union(
      polygon({
        points: [
          [0, stampHeight * point],
          ...new Array(11)
            .fill(0)
            .map(
              (v, a) =>
                [
                  Math.cos((a * Math.PI) / 2 / 10) * handleRadius,
                  stampHeight * point +
                    Math.sin((a * Math.PI) / 2 / 10) *
                      (stampHeight * (1 - point)),
                ] as Vec2
            ),
        ],
      }),

      polygon({
        points: [
          ...new Array(11)
            .fill(0)
            .map(
              (v, a) =>
                [
                  Math.cos(((1 - a / 10) * -1 * Math.PI) / 2) * handleRadius,
                  Math.pow(a / 10, handleExponent) * (stampHeight * point),
                ] as Vec2
            ),
          [0, stampHeight * point],
        ],
      })
    )
  )
  // TODO: Find a better name and move to options
  const cutHeight = 1

  const handleBottom = union(
    translate(
      [0, 0, pyramidOversize],
      pyramid({
        size: [
          width + 2 * pyramidOversize,
          depth + 2 * pyramidOversize,
          basePyramidHeight - pyramidOversize,
        ],
      })
    ),
    translate(
      [0, 0, pyramidOversize],
      rotate(
        [0, Math.PI, 0],
        intersect(
          pyramid({
            size: [
              width + 2 * pyramidOversize,
              depth + 2 * pyramidOversize,
              Math.min(
                width + 2 * pyramidOversize,
                depth + 2 * pyramidOversize
              ) / 2,
            ],
          }),
          cuboid({
            size: [
              width + 2 * pyramidOversize,
              depth + 2 * pyramidOversize,
              interfaceHeight + pyramidOversize,
            ],
            center: [0, 0, (interfaceHeight + pyramidOversize) / 2],
          })
        )
      )
    ),
    translate(
      [0, 0, -interfaceHeight + cutHeight / 2],
      cuboid({
        size: [interfaceWidth, interfaceDepth, cutHeight],
      })
    )
  )

  return union(handleTop, handleBottom)
}

export const grippyThing = (height: number, size: number) => {
  const inletSize = size / 2
  const inletHeight = 1
  const chamberHeight = height - 1

  return union(
    cuboid({
      size: [inletSize, inletSize, inletHeight],
      center: [0, 0, -inletHeight / 2 - chamberHeight],
    }),
    cuboid({
      size: [size, size, chamberHeight],
      center: [0, 0, -chamberHeight / 2],
    })
  )
}

const range = (start: number, end: number) => {
  const length = end - start
  return new Array(length).fill(0).map((_, i) => start + i)
}

export const generateStamp = (options?: StampOptions) => {
  const stampOptions = getDefaultStampOptions(options ?? {})
  const {
    interfaceHeight,
    interfaceWidth,
    holderRadius,
    holderHeight,
    width,
    depth,
    handleRadius,
    stampHeight,
  } = stampOptions

  const grippyThingSize = 6

  const minGrippyThingDist = 2

  const grippyThingsX = Math.floor(
    width / (grippyThingSize + minGrippyThingDist)
  )

  const grippyThingDistX =
    (width - grippyThingsX * grippyThingSize) / (grippyThingsX - 1)

  const grippyThingsY = Math.floor(
    depth / (grippyThingSize + minGrippyThingDist)
  )
  const grippyThingDistY =
    (width - grippyThingsX * grippyThingSize) / (grippyThingsX - 1)

  const topDistance = 0.6
  const grippyThingHeight = interfaceHeight - topDistance

  const grippyThings: Geom3[] = translate(
    [-width / 2, -depth / 2, -topDistance],
    range(0, grippyThingsX).flatMap(a =>
      range(0, grippyThingsY).flatMap(b => {
        const x = grippyThingSize / 2 + a * (grippyThingSize + grippyThingDistX)
        const y = grippyThingSize / 2 + b * (grippyThingSize + grippyThingDistY)
        return translate(
          [x, y, 0],
          grippyThing(grippyThingHeight, grippyThingSize)
        )
      })
    )
  )

  const stamp = union(
    subtract(
      generateHandle(options),
      translate(
        [0, 0, stampHeight - handleRadius],
        rotate(
          [Math.PI / 4, 0, 0],
          cuboid({ size: [interfaceWidth, holderRadius * 2, holderRadius * 2] })
        )
      ),
      grippyThings
    )
  )

  return stamp
}
