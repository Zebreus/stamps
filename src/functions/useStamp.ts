import { Geom3 } from "@jscad/modeling/src/geometries/types"
import { StampOptions } from "functions/defaultStampOptions"
import { useEffect, useRef, useState } from "react"

export const useStamp = (options?: StampOptions) => {
  const [stamp, setStamp] = useState<Geom3>()
  const workerRef = useRef<Worker>()

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../workers/stamp.worker.ts", import.meta.url)
    )
    workerRef.current.onmessage = (event: MessageEvent<Geom3>) => {
      console.log("WebWorker Response => ", event.data)
      setStamp(event.data)
    }
    workerRef.current?.postMessage(options)

    return () => {
      workerRef.current?.terminate()
    }
  }, [options])

  return [stamp]
}
