import { Vec2 } from "@jscad/modeling/src/maths/types"
import {
  chunkArray,
  chunkToShape,
  getHolesInChunk,
  groupChunks,
} from "utils/blockMap"

describe("chunk data works", () => {
  test("empty array does not crash", async () => {
    const chunkedData = chunkArray([], 0, 0)
    expect(chunkedData).toEqual([])
  })

  test("simple test", async () => {
    const testMap = [
      [1, 0],
      [0, 1],
    ] as const

    const expectedResultMap = [
      [0, -1],
      [-1, 1],
    ] as const

    const expectedGroupedChunks = [[[0, 0]], [[1, 1]]]

    const expectedShapes = [
      [
        [1, 0],
        [1, 1],
        [0, 1],
        [0, 0],
      ],
      [
        [2, 1],
        [2, 2],
        [1, 2],
        [1, 1],
      ],
    ]

    const expectedHoles: Vec2[][] = []

    const width = testMap[0].length
    const height = testMap.length

    const chunkedData = chunkArray(testMap.flat(), width, height)
    expect(chunkedData).toEqual(expectedResultMap.flat())

    const groupedChunks = groupChunks(chunkedData, width)
    expect(groupedChunks).toEqual(expectedGroupedChunks)

    const shapes = groupedChunks.map(chunk => chunkToShape(chunk))
    expect(shapes).toEqual(expectedShapes)

    const holes = getHolesInChunk(groupedChunks[0])
    expect(holes).toEqual(expectedHoles)
  })

  test("chunks get joined", async () => {
    const testMap = [
      [0, 1],
      [1, 1],
    ] as const

    const expectedResultMap = [
      [-1, 0],
      [0, 0],
    ] as const

    const expectedGroupedChunks = [
      [
        [1, 0],
        [0, 1],
        [1, 1],
      ],
    ]

    const expectedShapes = [
      [
        [2, 0],
        [2, 2],
        [0, 2],
        [0, 1],
        [1, 1],
        [1, 0],
      ],
    ]

    const expectedHoles: Vec2[][] = []

    const width = testMap[0].length
    const height = testMap.length

    const chunkedData = chunkArray(testMap.flat(), width, height)
    expect(chunkedData).toEqual(expectedResultMap.flat())

    const groupedChunks = groupChunks(chunkedData, width)
    expect(groupedChunks).toEqual(expectedGroupedChunks)

    const shapes = groupedChunks.map(chunk => chunkToShape(chunk))
    expect(shapes).toEqual(expectedShapes)

    const holes = getHolesInChunk(groupedChunks[0])
    expect(holes).toEqual(expectedHoles)
  })

  test("bigger test", async () => {
    const testMap = [
      [0, 1, 0, 1],
      [1, 1, 1, 0],
      [0, 0, 0, 1],
    ] as const

    const expectedResultMap = [
      [-1, 0, -1, 1],
      [0, 0, 0, -1],
      [-1, -1, -1, 2],
    ] as const

    const expectedGroupedChunks = [
      [
        [1, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [[3, 0]],
      [[3, 2]],
    ]

    const expectedShapes = [
      [
        [2, 0],
        [2, 1],
        [3, 1],
        [3, 2],
        [0, 2],
        [0, 1],
        [1, 1],
        [1, 0],
      ],
      [
        [4, 0],
        [4, 1],
        [3, 1],
        [3, 0],
      ],
      [
        [4, 2],
        [4, 3],
        [3, 3],
        [3, 2],
      ],
    ]

    const width = testMap[0].length
    const height = testMap.length

    const chunkedData = chunkArray(testMap.flat(), width, height)
    expect(chunkedData).toEqual(expectedResultMap.flat())

    const groupedChunks = groupChunks(chunkedData, width)
    expect(groupedChunks).toEqual(expectedGroupedChunks)

    const shapes = groupedChunks.map(chunk => chunkToShape(chunk))
    expect(shapes).toEqual(expectedShapes)
  })

  test("holes work", async () => {
    const testMap = [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ] as const

    const expectedResultMap = [
      [0, 0, 0],
      [0, -1, 0],
      [0, 0, 0],
    ] as const

    const expectedGroupedChunks = [
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [0, 1],
        [2, 1],
        [0, 2],
        [1, 2],
        [2, 2],
      ],
    ]

    const expectedShapes = [
      [
        [3, 0],
        [3, 3],
        [0, 3],
        [0, 0],
      ],
    ]

    const expectedHoles: Vec2[][] = [[[1, 1]]]

    const width = testMap[0].length
    const height = testMap.length

    const chunkedData = chunkArray(testMap.flat(), width, height)
    expect(chunkedData).toEqual(expectedResultMap.flat())

    const groupedChunks = groupChunks(chunkedData, width)
    expect(groupedChunks).toEqual(expectedGroupedChunks)

    const shapes = groupedChunks.map(chunk => chunkToShape(chunk))
    expect(shapes).toEqual(expectedShapes)

    const holes = getHolesInChunk(groupedChunks[0])
    expect(holes).toEqual(expectedHoles)
  })

  test("semi open hole works", async () => {
    const testMap = [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 0],
    ] as const

    const expectedResultMap = [
      [0, 0, 0],
      [0, -1, 0],
      [0, 0, -1],
    ] as const

    const expectedGroupedChunks = [
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [0, 1],
        [2, 1],
        [0, 2],
        [1, 2],
      ],
    ]

    const expectedShapes = [
      [
        [3, 0],
        [3, 2],
        [2, 2],
        [2, 3],
        [0, 3],
        [0, 0],
      ],
    ]

    const expectedHoles: Vec2[][] = [[[1, 1]]]

    const width = testMap[0].length
    const height = testMap.length

    const chunkedData = chunkArray(testMap.flat(), width, height)
    expect(chunkedData).toEqual(expectedResultMap.flat())

    const groupedChunks = groupChunks(chunkedData, width)
    expect(groupedChunks).toEqual(expectedGroupedChunks)

    const shapes = groupedChunks.map(chunk => chunkToShape(chunk))
    expect(shapes).toEqual(expectedShapes)

    const holes = getHolesInChunk(groupedChunks[0])
    expect(holes).toEqual(expectedHoles)

    const holeShape = chunkToShape(holes[0])
    expect(holeShape).toBeDefined()
  })

  test("crashTest", async () => {
    const shapeA = chunkToShape([[9, 2]])
    expect(shapeA).toEqual([
      [10, 2],
      [10, 3],
      [9, 3],
      [9, 2],
    ])
    const shape = chunkToShape([[9, 4]])
    expect(shape).toEqual([
      [10, 4],
      [10, 5],
      [9, 5],
      [9, 4],
    ])
  })
})

// eslint-disable-next-line jest/no-export
export {}
