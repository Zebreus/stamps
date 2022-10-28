export type StampOptions = {
  /** url of the motif. Can be any image */
  url?: string
  /** Horizontal distance between the mold walls and the stamp */
  interfaceMargin?: number
  /** Radius of the handle top */
  handleRadius?: number
  /** Bevel radius of the handle pyramid */
  baseBevel?: number

  // Horizontal measurements, ordered from outside to inside
  /** Thickness of the mold holder walls */
  holderWallSize?: number
  /** Distance between the mold holder and mold */
  tolerance?: number
  /** Thickness of the mold walls */
  moldWallThickness?: number
  /** Width of the molded stamp */
  width?: number
  /** Depth of the molded stamp */
  depth?: number

  // Vertical measurements, ordered from bottom to top
  /** Height of the mold holder bottom plate */
  bottomPlateHeight?: number
  /** Height of the mold bottom plate*/
  moldBottomHeight?: number
  /** Height of the letters */
  letterHeight?: number
  /** Height between the bottom of the stamp and the mold */
  siliconeHeight?: number
  /** Height that the stamp intersects with the mold */
  interfaceHeight?: number
  /** Height of the stamp handle */
  stampHeight?: number
}

export type ComputedStampOptions = Required<StampOptions> & {
  /** Width of the mold */
  moldWidth: number
  /** Depth of the mold */
  moldDepth: number
  /** Height of the mold */
  moldHeight: number
  // /** Height of the pyramid in the base */
  // basePyramidHeight: number
  /** Width of the interface */
  interfaceWidth: number
  /** Depth of the interface */
  interfaceDepth: number
}

export const getDefaultStampOptions = (options: Partial<StampOptions>) => {
  const defaultStampOptions: Required<StampOptions> = {
    url: "/qr.png",
    interfaceMargin: 1,
    handleRadius: 10,
    baseBevel: 2,
    holderWallSize: 3,
    tolerance: 0.1,
    moldWallThickness: 2,
    width: 40,
    depth: 40,
    bottomPlateHeight: 1,
    moldBottomHeight: 0.6,
    letterHeight: 1,
    siliconeHeight: 0.6,
    interfaceHeight: 3,
    stampHeight: 50,
  }

  const stampOptions = {
    ...defaultStampOptions,
    ...options,
  }

  const computedStampOptions: ComputedStampOptions = {
    ...stampOptions,
    moldWidth: stampOptions.width + stampOptions.moldWallThickness * 2,
    moldDepth: stampOptions.depth + stampOptions.moldWallThickness * 2,
    interfaceWidth: stampOptions.width - stampOptions.interfaceMargin * 2,
    interfaceDepth: stampOptions.depth - stampOptions.interfaceMargin * 2,
    moldHeight:
      stampOptions.moldBottomHeight +
      stampOptions.letterHeight +
      stampOptions.siliconeHeight +
      stampOptions.interfaceHeight,
  }

  return computedStampOptions
}
