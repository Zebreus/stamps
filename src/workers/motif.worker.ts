import { generateMotif, MotifOptions } from "utils/generateMotif"

export type GenerateMotifMessage = {
  options: MotifOptions
}

addEventListener("message", (event: MessageEvent<GenerateMotifMessage>) => {
  postMessage(generateMotif(event.data.options))
})
