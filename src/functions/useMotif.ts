import { Geom3 } from "@jscad/modeling/src/geometries/types"
import { Vec3 } from "@jscad/modeling/src/maths/types"
import { useEffect, useRef, useState } from "react"
import { GenerateMotifMessage } from "workers/motif.worker"

/**
 *
 * @param url url of the motif. Can be any image
 * @param maxSize Maximum length of the longer size of the motif
 * @returns
 */
export const useHeightMap = (url: string, maxSize: number) => {
  const [heightMap, setHeightMap] = useState<{
    width: number
    length: number
    data: number[]
  }>()

  const maxLength = maxSize || Infinity

  useEffect(() => {
    console.log("img")
    const img = new Image()
    const onload = async () => {
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      const longerSide = Math.max(img.naturalHeight, img.naturalWidth)

      const scalingFactor = Math.min(longerSide, maxLength) / longerSide
      const width = Math.floor(img.naturalWidth * scalingFactor)
      const depth = Math.floor(img.naturalHeight * scalingFactor)

      if (!context) {
        throw new Error("No context")
      }

      context?.drawImage(img, 0, 0, width, depth)

      const pixels = context.getImageData(0, 0, width, depth, {
        colorSpace: "srgb",
      })

      const pixelObjects = [...pixels.data].flatMap((pixel, index, array) =>
        index % 4 === 0
          ? [
              {
                red: array[index],
                green: array[index + 1],
                blue: array[index + 2],
                alpha: array[index + 3],
              },
            ]
          : []
      )

      const heightMap = {
        data: pixelObjects.map(
          pixel =>
            (1 - Math.min(pixel.red ?? 0, pixel.green ?? 0, pixel.blue ?? 0)) *
            (pixel.alpha ?? 1)
        ),
        width: pixels.width,
        length: pixels.height,
      }
      setHeightMap(heightMap)
    }
    img.onload = onload
    img.src = url
  }, [maxLength, url])

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
  resolution?: number
}

export const useMotif = (options: Options = {}) => {
  const heightMap = useHeightMap(
    options.url ?? "/qr.png",
    options.resolution ?? 150
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

  return {
    motif,
    naturalAspect: (heightMap?.width ?? 1) / (heightMap?.length ?? 1),
  }
}
