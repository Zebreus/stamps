import { Geom3 } from "@jscad/modeling/src/geometries/types"
import {
  mirror,
  MirrorOptions,
} from "@jscad/modeling/src/operations/transforms"

export const copyMirror = (options: MirrorOptions, rest: Geom3) => {
  return [rest, mirror(options, rest)]
}
