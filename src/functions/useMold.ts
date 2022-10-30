import { Geom3 } from "@jscad/modeling/src/geometries/types"
import { StampOptions } from "functions/defaultStampOptions"
import { useMotif } from "functions/useMotif"
import { useEffect, useMemo, useRef, useState } from "react"
import { GenerateMoldMessage } from "workers/mold.worker"

export const useMold = (options?: StampOptions) => {
  const [mold, setMold] = useState<Geom3>()
  const workerRef = useRef<Worker>()
  const motif = useMotif(
    useMemo(
      () => ({
        url: options?.url ?? "/qr.png",
        size: [50, 50, 1],
      }),
      [options?.url]
    )
  )

  useEffect(() => {
    console.log("worker")
    workerRef.current = new Worker(
      new URL("../workers/mold.worker.ts", import.meta.url)
    )
    workerRef.current.onmessage = (event: MessageEvent<Geom3>) => {
      console.log("WebWorker Response => ", event.data)
      setMold(event.data)
    }

    const msg: GenerateMoldMessage = {
      stampOptions: options ?? {},
      motif: motif,
    }

    workerRef.current?.postMessage(msg)

    return () => {
      workerRef.current?.terminate()
    }
  }, [options, motif])

  return mold
}
