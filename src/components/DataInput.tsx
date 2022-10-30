import {
  getDefaultStampOptions,
  StampOptions,
} from "functions/defaultStampOptions"
import { Dispatch, ReactNode, SetStateAction } from "react"

const MyLabel = ({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: ReactNode
}) => {
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label" htmlFor={htmlFor}>
        <span className="label-text">{label}</span>
      </label>
      {children}
    </div>
  )
}

type NumberInputProps = {
  value: number
  setValue: (value: number) => void
  id: string
  label: string
  unit?: string
  min?: number
  max: number
  step?: number
}

const NumberInput = ({
  value,
  setValue,
  id,
  label,
  min = 0,
  max,
  step = 1,
  unit = "",
}: NumberInputProps) => {
  return (
    <MyLabel label={label} htmlFor={id}>
      <div className="flex flex-row">
        <span className="mx-2 w-20">
          {value}
          {unit}
        </span>
        <input
          id={id}
          type="range"
          className="range w-full"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => setValue(Number(e.target.value) ?? undefined)}
        />
      </div>
    </MyLabel>
  )
}

// type TextInputProps = {
//   value: string
//   setValue: (value: string) => void
//   id: string
//   label: string
// }

// const TextInput = ({ value, setValue, id, label }: TextInputProps) => {
//   return (
//     <div className="form-control w-full max-w-xs">
//       <label className="label" htmlFor={id}>
//         <span className="label-text">{label}</span>
//       </label>
//       <input
//         id={id}
//         type="text"
//         placeholder="Type here"
//         className="input input-bordered w-full max-w-xs"
//         value={value}
//         onChange={e => setValue(e.target.value)}
//       />
//     </div>
//   )
// }

type DataInputProps = {
  value: StampOptions
  setValue: Dispatch<SetStateAction<StampOptions>>
}

export const DataInput = ({ value, setValue }: DataInputProps) => {
  const realData = getDefaultStampOptions(value)

  return (
    <div className="">
      <MyLabel label={"Select motif"} htmlFor={"motifUpload"}>
        <input
          id="motifUpload"
          type="file"
          className="file-input file-input-bordered file-input-primary w-full max-w-xs mx-2"
          onChange={event => {
            console.log(event.target.files?.[0])
            const image = event.target.files?.[0]
            image && setValue(d => ({ ...d, url: URL.createObjectURL(image) }))
          }}
          accept="image/*"
        />
      </MyLabel>
      <NumberInput
        id="width"
        label="Stamp width"
        unit="mm"
        value={realData.width}
        setValue={newValue => setValue(d => ({ ...d, width: newValue }))}
        min={10}
        max={200}
        step={1}
      />
      <NumberInput
        id="depth"
        label="Stamp depth"
        unit="mm"
        value={realData.depth}
        setValue={newValue => setValue(d => ({ ...d, depth: newValue }))}
        min={10}
        max={200}
        step={1}
      />
      <NumberInput
        id="handleRadius"
        label="Radius of the handle top"
        unit="mm"
        value={realData.handleRadius}
        setValue={newValue => setValue(d => ({ ...d, handleRadius: newValue }))}
        min={0}
        max={80}
        step={0.5}
      />
      <NumberInput
        id="handleExponent"
        label="Curvature of the handle middle"
        unit=""
        value={realData.handleExponent}
        setValue={newValue =>
          setValue(d => ({ ...d, handleExponent: newValue }))
        }
        min={0}
        max={3}
        step={0.01}
      />
      <NumberInput
        id="stampHeight"
        label="How tall should the stamp be?"
        unit="mm"
        value={realData.stampHeight}
        setValue={newValue => setValue(d => ({ ...d, stampHeight: newValue }))}
        min={0}
        max={200}
        step={1}
      />
      <NumberInput
        id="letterHeight"
        label="How tall should the letters be?"
        unit="mm"
        value={realData.letterHeight}
        setValue={newValue => setValue(d => ({ ...d, letterHeight: newValue }))}
        min={0}
        max={10}
        step={0.1}
      />

      <NumberInput
        id="interfaceHeight"
        label="Height that the stamp intersects with the mold"
        unit="mm"
        value={realData.interfaceHeight}
        setValue={newValue =>
          setValue(d => ({ ...d, interfaceHeight: newValue }))
        }
        min={0}
        max={10}
        step={0.1}
      />
      <NumberInput
        id="interfaceMargin"
        label="Horizontal distance between the mold walls and the stamp"
        unit="mm"
        value={realData.interfaceMargin}
        setValue={newValue =>
          setValue(d => ({ ...d, interfaceMargin: newValue }))
        }
        min={0}
        max={10}
        step={0.1}
      />
      <NumberInput
        id="pyramidOversize"
        label="How much bigger then the base the pyramid is"
        unit="mm"
        value={realData.pyramidOversize}
        setValue={newValue =>
          setValue(d => ({ ...d, pyramidOversize: newValue }))
        }
        min={0}
        max={10}
        step={0.1}
      />
      <NumberInput
        id="moldWallThickness"
        label="Thickness of the mold walls"
        unit="mm"
        value={realData.moldWallThickness}
        setValue={newValue =>
          setValue(d => ({ ...d, moldWallThickness: newValue }))
        }
        min={0}
        max={10}
        step={0.1}
      />
      <NumberInput
        id="bottomPlateHeight"
        label="Height of the mold holder bottom plate"
        unit="mm"
        value={realData.bottomPlateHeight}
        setValue={newValue =>
          setValue(d => ({ ...d, bottomPlateHeight: newValue }))
        }
        min={0}
        max={10}
        step={0.1}
      />
      <NumberInput
        id="moldBottomHeight"
        label="Height of the mold bottom plate"
        unit="mm"
        value={realData.moldBottomHeight}
        setValue={newValue =>
          setValue(d => ({ ...d, moldBottomHeight: newValue }))
        }
        min={0}
        max={10}
        step={0.1}
      />
      <NumberInput
        id="motifSize"
        label="The image will be scaled to this resolution"
        unit="px"
        value={realData.motifSize}
        setValue={newValue => setValue(d => ({ ...d, motifSize: newValue }))}
        min={5}
        max={500}
        step={5}
      />
    </div>
  )
}
