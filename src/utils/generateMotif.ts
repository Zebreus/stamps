import { Vec2, Vec3 } from "@jscad/modeling/src/maths/types"
import { union } from "@jscad/modeling/src/operations/booleans"
import {
  scale as scaleJscad,
  translate,
} from "@jscad/modeling/src/operations/transforms"
import { polyhedron } from "@jscad/modeling/src/primitives"
import { removeHoles, triangulate } from "poly-partition"
import {
  chunkArray,
  chunkToShape,
  getHolesInChunk,
  groupChunks,
} from "utils/blockMap"

export type MotifOptions = {
  /** url of the motif. Can be any image */
  heightMap?: { width: number; length: number; data: number[] } | undefined
  size?: Vec3
  /* Clip every value higher than this
   * a number between 0 and 1
   */
  clipTop?: number
  /* Clip every value lower than this
   * a number between 0 and 1
   */
  clipBottom?: number
}

// Extrude a 3d model from a path of 2d points
const shapeToPolyhedron = (shape: Vec2[], holeShapes: Vec2[][]) => {
  const holesPoints = holeShapes.flatMap(hole => [
    ...hole.map(([x, y]) => [x, y, 0] as Vec3),
    ...hole.map(([x, y]) => [x, y, 1] as Vec3),
  ])
  const shapePoints = [
    ...shape.map(([x, y]) => [x, y, 0] as Vec3),
    ...shape.map(([x, y]) => [x, y, 1] as Vec3),
  ]
  const points = [...shapePoints, ...holesPoints]
  // points.forEach(point => {
  //   if (point.includes(6.7)) {
  //     debugger
  //   }
  // })
  const holePointsOffsets = holeShapes.reduce<number[]>(
    (acc, holeShape) => {
      return [...acc, holeShape.length * 2 + acc[acc.length - 1]]
    },
    [shapePoints.length]
  )
  const contour = shape.map(([x, y]) => ({ x, y }))

  const holeContours = holeShapes.map(holeShape =>
    holeShape.map(([x, y]) => ({ x, y })).reverse()
  )
  const merged = removeHoles(contour, holeContours)
  const contours = triangulate(merged, true)
  const surface = contours.map(contour =>
    contour.map(({ x, y }) =>
      points.findIndex(([x2, y2, z3]) => x === x2 && y === y2 && z3 === 0)
    )
  )

  const topSurface = contours.map(contour =>
    contour
      .reverse()
      .map(({ x, y }) =>
        points.findIndex(([x2, y2, z3]) => x === x2 && y === y2 && z3 === 1)
      )
  )

  const holeFaces = holeShapes.flatMap((holeShape, index) => {
    const offset = holePointsOffsets[index]
    return [
      ...new Array(holeShape.length)
        .fill(0)
        .map((_, index) => [
          ((index + 1) % holeShape.length) + offset,
          ((index + 1) % holeShape.length) + holeShape.length + offset,
          index + offset + holeShape.length,
          index + offset,
        ]),
    ]
  })
  const faces = [
    ...new Array(shape.length)
      .fill(0)
      .map((_, index) => [
        index,
        index + shape.length,
        ((index + 1) % shape.length) + shape.length,
        (index + 1) % shape.length,
      ]),
    ...holeFaces,

    ...surface,
    ...topSurface,
  ]

  return polyhedron({ points: points, faces, orientation: "inward" })
}

const blockMapPoly = (data: (0 | 1)[], width: number, height: number) => {
  const chunkedData = chunkArray(data, width, height)
  const groupedChunks = groupChunks(chunkedData, width)
  const chunksWithHoles = groupedChunks.map(chunk => ({
    chunk: chunk,
    holes: getHolesInChunk(chunk),
  }))

  const shapesWithHoles = chunksWithHoles.map(({ chunk, holes }) => ({
    shape: chunkToShape(chunk, 0.01),
    holes: holes.map(hole => chunkToShape(hole, 0.02)),
  }))

  const geometry = shapesWithHoles.map(({ shape, holes }) =>
    shapeToPolyhedron(shape, holes)
  )

  return union(geometry)
}

const blockMapInternal = (
  heightMap: {
    width: number
    length: number
    data: (0 | 1)[]
  },
  scale: Vec3
) => {
  const { width, length, data } = heightMap

  const myBlockMap = blockMapPoly(data, width, length)
  return scaleJscad([scale[0] / width, scale[1] / length, scale[2]], myBlockMap)
}

export const generateMotif = ({
  heightMap,
  size = [40, 40, 1],
  clipBottom = 0.49,
  clipTop = 0.51,
}: MotifOptions) => {
  const data = heightMap

  const clippedHeightMap = data && {
    ...data,
    data: data.data.map(value => {
      const normalizedValue = value / 255
      if (normalizedValue > clipTop) return 1
      if (normalizedValue < clipBottom) return 0
      return 1
    }),
  }

  if (clipBottom > clipTop) {
    throw new Error("clipBottom must be lower than clipTop")
  }

  const [width, depth, height] = size

  if (!clippedHeightMap) {
    return undefined
  }

  return translate(
    [-width / 2, -depth / 2, height / 2],
    blockMapInternal(clippedHeightMap, [width, depth, height])
  )
}
