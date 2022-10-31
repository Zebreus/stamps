import { Geom3 } from "@jscad/modeling/src/geometries/types"
import { StampOptions } from "functions/defaultStampOptions"
import { generateMold } from "utils/generateMold"

export type GenerateMoldMessage = {
  stampOptions: StampOptions
  motif: Geom3 | undefined
  naturalAspect: number
}

addEventListener("message", (event: MessageEvent<GenerateMoldMessage>) => {
  postMessage(
    generateMold(
      event.data.stampOptions,
      event.data.motif,
      event.data.naturalAspect
    )
  )
})
