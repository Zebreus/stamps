import { Geom3 } from "@jscad/modeling/src/geometries/types"
import { StampOptions } from "functions/defaultStampOptions"
import { generateMold } from "utils/generateMold"

export type GenerateMoldMessage = {
  stampOptions: StampOptions
  motif: Geom3 | undefined
}

addEventListener("message", (event: MessageEvent<GenerateMoldMessage>) => {
  postMessage(generateMold(event.data.stampOptions, event.data.motif))
})
