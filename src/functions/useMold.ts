import { subtract } from "@jscad/modeling/src/operations/booleans"
import { rotate, translate } from "@jscad/modeling/src/operations/transforms"
import { cuboid } from "@jscad/modeling/src/primitives"
import { copyMirror } from "functions/copyMirror"
import {
  getDefaultStampOptions,
  StampOptions,
} from "functions/defaultStampOptions"
import { useMotif } from "functions/useMotif"

export const useMold = (options?: StampOptions) => {
  const stampOptions = getDefaultStampOptions(options ?? {})
  const {
    url,
    width,
    depth,
    siliconeHeight,
    interfaceHeight,
    letterHeight,
    moldBottomHeight,
    moldWallThickness,
    moldWidth,
    moldDepth,
    moldHeight,
    tolerance,
  } = stampOptions
  const baseHeight = siliconeHeight + interfaceHeight

  const motif = useMotif({ url, size: [width, depth, letterHeight] })

  const thing = subtract(
    cuboid({
      size: [moldWidth - 2 * tolerance, moldDepth - 2 * tolerance, moldHeight],
    }),
    copyMirror(
      { normal: [1, 0, 0], origin: [0, 0, 0] },
      translate(
        [-moldWidth / 2, 0, moldHeight * 0.75],
        rotate(
          [0, Math.PI / 4, 0],
          cuboid({
            size: [moldWallThickness * 2, moldDepth, moldWallThickness * 2],
          })
        )
      )
    ),
    copyMirror(
      { normal: [0, 1, 0], origin: [0, 0, 0] },
      translate(
        [0, -moldDepth / 2, moldHeight * 0.75],
        rotate(
          [Math.PI / 4, 0, 0],
          cuboid({
            size: [moldWidth, moldWallThickness * 2, moldWallThickness * 2],
          })
        )
      )
    ),
    translate(
      [0, 0, +moldHeight / 2 - baseHeight / 2],
      cuboid({ size: [width, depth, baseHeight] })
    ),
    ...(motif
      ? [
          translate(
            [0, 0, -(moldHeight / 2) + letterHeight / 2 + moldBottomHeight],
            motif
          ),
        ]
      : [])
  )

  return thing
}
