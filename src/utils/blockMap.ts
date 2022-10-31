import { Vec2 } from "@jscad/modeling/src/maths/types"

/**
 *
 * @param data
 * @param width
 * @param height
 * @returns An array like data containing the chunk ids for each pixel. -1 for no chunk, 0 for chunk 0, 1 for chunk 1, etc.
 */
export const chunkArray = (data: (0 | 1)[], width: number, height: number) => {
  const getValue = (x: number, y: number, data: number[]) => {
    if (x < 0 || y < 0 || x >= width || y >= height) {
      return -1
    }
    return data[x + y * width] ?? -1
  }

  let currentChunk = -1
  const chunkedData = data.reduce((acc, value, index) => {
    if (value === 0) {
      acc.push(-1)
      return acc
    }
    const x = index % width
    const y = Math.floor(index / width)
    const left = getValue(x - 1, y, acc)
    const top = getValue(x, y - 1, acc)

    if (left !== -1 && top !== -1 && left !== top) {
      const removedChunk = Math.max(left, top)
      const joinedChunk = Math.min(left, top)
      acc.push(joinedChunk)
      currentChunk -= 1
      return acc.map(old =>
        old === removedChunk ? joinedChunk : old > removedChunk ? old - 1 : old
      )
    }
    if (left !== -1) {
      acc.push(left)
      return acc
    }
    if (top !== -1) {
      acc.push(top)
      return acc
    }
    acc.push(++currentChunk)
    return acc
  }, [] as number[])

  return chunkedData
}

export const groupChunks = (chunkedData: number[], width: number) => {
  const groupedChunks = chunkedData.reduce<Array<Vec2[]>>(
    (acc, value, index) => {
      if (value === -1) {
        return acc
      }
      const x = index % width
      const y = Math.floor(index / width)
      if (!acc[value]) {
        acc[value] = []
      }
      acc[value].push([x, y])
      return acc
    },
    []
  )

  return groupedChunks
}

export const getHolesInChunk = (chunk: Vec2[]) => {
  const minX = Math.min(...chunk.map(([x]) => x))
  const minY = Math.min(...chunk.map(([, y]) => y))
  const maxX = Math.max(...chunk.map(([x]) => x))
  const maxY = Math.max(...chunk.map(([, y]) => y))
  const width = maxX - minX + 3
  const height = maxY - minY + 3
  const offsetX = minX - 1
  const offsetY = minY - 1
  const data = new Array(width * height).fill(1)

  chunk.forEach(([x, y]) => {
    data[x - offsetX + (y - offsetY) * width] = 0
  })

  const chunkData = chunkArray(data, width, height)
  const chunks = groupChunks(chunkData, width)
  const [, ...holes] = chunks

  const fixedHoles = holes.map(hole =>
    hole.map(([x, y]) => [x + offsetX, y + offsetY] as Vec2)
  )

  return fixedHoles
}

export const chunkToShape = (chunks: Vec2[], offset = 0) => {
  const chunk = [...chunks.map(c => [...c] as Vec2)]
  //   console.log("shaping", JSON.stringify([...chunk]), offset)
  const shape: Array<Vec2> = []
  let direction: "left" | "down" | "right" | "up" = "right"
  let currentPoint: Vec2 = chunk[0]

  const nextDirection = () => {
    switch (direction) {
      case "right":
        shape.push([currentPoint[0] + 1 - offset, currentPoint[1] + offset])
        direction = "down"
        break
      case "down":
        shape.push([currentPoint[0] + 1 - offset, currentPoint[1] + 1 - offset])
        direction = "left"
        break
      case "left":
        shape.push([currentPoint[0] + offset, currentPoint[1] + 1 - offset])
        direction = "up"
        break
      case "up":
        shape.push([currentPoint[0] + offset, currentPoint[1] + offset])
        direction = "right"
        break
    }
  }

  const convexNextDirection = () => {
    switch (direction) {
      case "right":
        shape.push([currentPoint[0] + 1 + offset, currentPoint[1] + offset])
        direction = "up"
        break
      case "down":
        shape.push([currentPoint[0] + 1 - offset, currentPoint[1] + 1 + offset])
        direction = "right"
        break
      case "left":
        shape.push([currentPoint[0] - offset, currentPoint[1] + 1 - offset])
        direction = "down"
        break
      case "up":
        shape.push([currentPoint[0] + offset, currentPoint[1] - offset])
        direction = "left"
        break
    }
  }

  const getNextPoint = (): Vec2 => {
    switch (direction) {
      case "right":
        return [currentPoint[0] + 1, currentPoint[1]]
      case "down":
        return [currentPoint[0], currentPoint[1] + 1]
      case "left":
        return [currentPoint[0] - 1, currentPoint[1]]
      case "up":
        return [currentPoint[0], currentPoint[1] - 1]
    }
  }

  const getConvexPoint = (): Vec2 => {
    switch (direction) {
      case "right":
        return [currentPoint[0] + 1, currentPoint[1] - 1]
      case "down":
        return [currentPoint[0] + 1, currentPoint[1] + 1]
      case "left":
        return [currentPoint[0] - 1, currentPoint[1] + 1]
      case "up":
        return [currentPoint[0] - 1, currentPoint[1] - 1]
    }
  }

  const exists = (point: Vec2) => {
    return chunk.find(([x, y]) => x === point[0] && y === point[1])
  }

  const step = () => {
    const nextPoint = getNextPoint()
    const nextPointExists = exists(nextPoint)

    const convexPoint = getConvexPoint()
    const convexPointExists = exists(convexPoint)
    // log(
    //   "current",
    //   currentPoint,
    //   "next",
    //   nextPoint,
    //   "exists",
    //   nextPointExists,
    //   "dir",
    //   direction
    // )
    if (convexPointExists) {
      convexNextDirection()
      currentPoint = convexPoint
      return
    }

    if (nextPointExists) {
      currentPoint = nextPoint
      return
    }

    nextDirection()
  }

  const checkDone = () => {
    if (chunk.length === 0) {
      return true
    }
    if (shape.length === 0) {
      return false
    }
    const [lastX, lastY] = shape[shape.length - 1]
    const [firstX, firstY] = chunk[0]
    return lastX === firstX + offset && lastY === firstY + offset
  }

  while (!checkDone()) {
    step()
  }

  //   log("SHAPE:", shape)

  return shape
}
