import { Geom3 } from "@jscad/modeling/src/geometries/types"
import { Vec3 } from "@jscad/modeling/src/maths/types"
import { useEffect, useRef, useState } from "react"
import { GenerateMotifMessage } from "workers/motif.worker"

export const useHeightMap = (url: string, maxSize: [number, number]) => {
  const [heightMap, setHeightMap] = useState<{
    width: number
    length: number
    data: number[]
  }>()

  const maxWidth = maxSize?.[0] || Infinity
  const maxDepth = maxSize?.[1] || Infinity

  useEffect(() => {
    console.log("img")
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
  /**
   * Resolution
   */
  resolution?: [number, number]
}

export const useMotif = (options: Options = {}) => {
  const heightMap = useHeightMap(
    options.url ?? "/qr.png",
    options.resolution ?? [150, 150]
  )

  const [motif, setMotif] = useState<Geom3>()
  const workerRef = useRef<Worker>()

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../workers/motif.worker.ts", import.meta.url)
    )
    workerRef.current.onmessage = (event: MessageEvent<Geom3>) => {
      console.log("Motif Worker Response => ", event.data)
      setMotif(event.data)
    }

    const msg: GenerateMotifMessage = {
      options: { ...options, heightMap: heightMap },
    }

    workerRef.current?.postMessage(msg)

    return () => {
      workerRef.current?.terminate()
    }
  }, [options, heightMap])

  return motif
}
