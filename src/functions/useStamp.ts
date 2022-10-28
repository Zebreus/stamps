import { Geom3 } from "@jscad/modeling/src/geometries/types"
import { Vec2, Vec3 } from "@jscad/modeling/src/maths/types"
import { subtract, union } from "@jscad/modeling/src/operations/booleans"
import { extrudeRotate } from "@jscad/modeling/src/operations/extrusions"
import { rotate, translate } from "@jscad/modeling/src/operations/transforms"
import { cuboid, polygon, polyhedron } from "@jscad/modeling/src/primitives"
import { copyMirror } from "functions/copyMirror"
import {
  getDefaultStampOptions,
  StampOptions,
} from "functions/defaultStampOptions"

// module handle() {
//     lowerHandleHeight = 30;

//     point = 1 - (stampRadius / stampHeight);
//     exponent = 1.3;
//     lowerPoint = 0.7;
//     translate([0,0,0])
//     rotate_extrude() {
//         polygon(points = [
//             [0,stampHeight*point],
//             for (a = [0:10]) [cos(a*90/10)*(stampRadius),stampHeight*point + sin(a*90/10)*(stampHeight*(1-point))] ,
//             [0,stampHeight]
//         ]);
//         polygon(points = [
//             [0,stampHeight * point],
//             for (a = [0:0.1:1]) [cos(a*-90)*(stampRadius),pow((1-a),exponent)*(stampHeight*(point))] ,
//             [0,0]
//         ]);
//     }

//     minkowski(){
//         $fn = 8;
//         union(){
//             pyramid([interfaceWidth-baseBevel, interfaceDepth-baseBevel, basePyramidHeight], center=true);
//             translate(-[(interfaceWidth-baseBevel)/2, (interfaceDepth-baseBevel)/2, interfaceHeight])
//             cube([(interfaceWidth-baseBevel), (interfaceDepth-baseBevel), interfaceHeight]);
//         }
//         difference(){
//             sphere(d=baseBevel);
//             translate([0,0,-baseBevel])
//             cube([baseBevel*2,baseBevel*2,baseBevel*2], center=true);
//         }
//     }

// }

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

export const useHandle = (options?: StampOptions) => {
  const stampOptions = getDefaultStampOptions(options ?? {})
  const {
    interfaceHeight,
    stampHeight,
    handleRadius,
    handleExponent,
    interfaceWidth,
    interfaceDepth,
    baseBevel,
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

  //     minkowski(){
  //         $fn = 8;
  //         union(){
  //             pyramid([interfaceWidth-baseBevel, interfaceDepth-baseBevel, basePyramidHeight], center=true);
  //             translate(-[(interfaceWidth-baseBevel)/2, (interfaceDepth-baseBevel)/2, interfaceHeight])
  //             cube([(interfaceWidth-baseBevel), (interfaceDepth-baseBevel), interfaceHeight]);
  //         }
  //         difference(){
  //             sphere(d=baseBevel);
  //             translate([0,0,-baseBevel])
  //             cube([baseBevel*2,baseBevel*2,baseBevel*2], center=true);
  //         }
  //     }

  const handleBottom = union(
    pyramid({
      size: [interfaceWidth, interfaceDepth, basePyramidHeight],
    }),
    translate(
      [0, 0, -interfaceHeight / 2],
      cuboid({
        size: [interfaceWidth, interfaceDepth, interfaceHeight],
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

export const useStamp = (options?: StampOptions) => {
  const stampOptions = getDefaultStampOptions(options ?? {})
  const {
    interfaceHeight,
    interfaceWidth,
    interfaceDepth,
    holderRadius,
    holderHeight,
  } = stampOptions

  const cutSide = interfaceHeight - 1

  const cut = union(
    copyMirror(
      { normal: [1, 0, 0] },
      translate(
        [(cutSide - interfaceWidth) / 2, 0, -cutSide / 2],
        subtract(
          cuboid({ size: [cutSide, interfaceDepth, cutSide] }),
          translate(
            [cutSide / 2, 0, cutSide / 2],
            rotate(
              [0, Math.PI / 4, 0],
              cuboid({
                size: [
                  Math.sqrt(Math.pow(cutSide, 2) * 2),
                  interfaceDepth,
                  Math.sqrt(Math.pow(cutSide, 2) * 2),
                ],
              })
            )
          )
        )
      )
    ),
    copyMirror(
      { normal: [0, 1, 0] },
      translate(
        [0, (cutSide - interfaceDepth) / 2, -cutSide / 2],
        subtract(
          cuboid({ size: [interfaceWidth, cutSide, cutSide] }),
          translate(
            [0, cutSide / 2, cutSide / 2],
            rotate(
              [Math.PI / 4, 0, 0],
              cuboid({
                size: [
                  interfaceWidth,
                  Math.sqrt(Math.pow(cutSide, 2) * 2),

                  Math.sqrt(Math.pow(cutSide, 2) * 2),
                ],
              })
            )
          )
        )
      )
    )
  )

  const grippyThingSize = 6

  const numberOfGrippyThings = 5

  const grippyThings: Geom3[] = translate(
    [-interfaceWidth / 2, -interfaceDepth / 2, 0],
    range(0, numberOfGrippyThings).flatMap(a =>
      range(0, numberOfGrippyThings).flatMap(b => {
        const x = ((a + 0.5) * interfaceWidth) / numberOfGrippyThings
        const y = ((b + 0.5) * interfaceDepth) / numberOfGrippyThings
        return translate(
          [x, y, 0],
          grippyThing(interfaceHeight, grippyThingSize)
        )
      })
    )
  )

  const stamp = union(
    subtract(
      useHandle(options),
      translate(
        [0, 0, holderHeight],
        rotate(
          [Math.PI / 4, 0, 0],
          cuboid({ size: [interfaceWidth, holderRadius * 2, holderRadius * 2] })
        )
      ),
      cut,
      grippyThings
    )
  )

  return [stamp]
}
