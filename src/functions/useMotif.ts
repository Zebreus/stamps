import { Geom3 } from "@jscad/modeling/src/geometries/types"
import { Vec3 } from "@jscad/modeling/src/maths/types"
import { subtract, union } from "@jscad/modeling/src/operations/booleans"
import { translate } from "@jscad/modeling/src/operations/transforms"
import { cuboid } from "@jscad/modeling/src/primitives"
//@ts-expect-error: no types available
import { extrudeSurface } from "jscad-surface"
import { useEffect, useMemo, useState } from "react"

const useHeightMap = (url: string, maxSize: [number, number]) => {
  const [heightMap, setHeightMap] = useState<{
    width: number
    length: number
    data: number[]
  }>()

  const maxWidth = maxSize?.[0] || Infinity
  const maxDepth = maxSize?.[1] || Infinity

  useEffect(() => {
    const img = new Image()
    const onload = async () => {
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      const width = Math.min(img.naturalWidth, maxWidth)
      const depth = Math.min(img.naturalHeight, maxDepth)

      if (!context) {
        throw new Error("No context")
      }

      context?.drawImage(img, 0, 0, width, depth)

      const pixels = context.getImageData(0, 0, width, depth)
      const heightMap = {
        data: [...pixels.data].flatMap((subpixel, index) =>
          index % 4 === 3 ? [subpixel] : []
        ),
        width: pixels.width,
        length: pixels.height,
      }
      setHeightMap(heightMap)
    }
    img.onload = onload
    img.src = url
  }, [maxDepth, maxWidth, url])

  return heightMap
}

type Options = {
  /** url of the motif. Can be any image */
  url?: string
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

export const useMotif = ({
  url = "/qr.png",
  size = [40, 40, 1],
  clipBottom = 0.49,
  clipTop = 0.51,
}: Options = {}) => {
  const data = useHeightMap(url, [150, 150])

  if (clipBottom > clipTop) {
    throw new Error("clipBottom must be lower than clipTop")
  }

  const [width, depth, height] = size

  const clippedHeight = clipTop - clipBottom
  const unclippedHeight = height * (1 / clippedHeight)

  const geometry = useMemo(() => {
    if (!data) {
      return undefined
    }

    const mysurface: Geom3 = translate(
      [-width / 2, depth / 2, -clipBottom * unclippedHeight],
      extrudeSurface(
        {
          scale: [
            width / data.width,
            depth / data.length,
            (1 / 256) * unclippedHeight,
          ],
          smooth: 0,
          base: 1,
        },
        data
      )
    )

    const cutCube = union(
      translate(
        [0, 0, -unclippedHeight / 2],
        cuboid({ size: [width, depth, unclippedHeight] })
      ),
      translate(
        [0, 0, unclippedHeight / 2 + (clipTop - clipBottom) * unclippedHeight],
        cuboid({ size: [width, depth, unclippedHeight] })
      )
    )

    return translate([0, 0, -height / 2], subtract(mysurface, cutCube))
  }, [clipBottom, clipTop, data, depth, unclippedHeight, width, height])

  return geometry
}
