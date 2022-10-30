import { StampOptions } from "functions/defaultStampOptions"
import { generateStamp } from "utils/generateStamp"

addEventListener("message", (event: MessageEvent<StampOptions>) => {
  postMessage(generateStamp(event.data))
})
