// @ts-expect-error: No types available
import { solidsAsBlob } from "@jscad/io"
import { Geom3 } from "@jscad/modeling/src/geometries/types"
import { DataInput } from "components/DataInput"
import { StampOptions } from "functions/defaultStampOptions"
import { useMold } from "functions/useMold"
import { useStamp } from "functions/useStamp"
import dynamic from "next/dynamic"
import { useState } from "react"

const Renderer = dynamic(
  () => import("jscad-react").then(mod => mod.Renderer),
  {
    ssr: false,
  }
)

const downloadGeometry = (geometry: Geom3, name: string) => {
  const x: Blob = solidsAsBlob(geometry, { format: "stl" })
  const url = URL.createObjectURL(x)
  const link = document.createElement("a")
  link.href = url
  link.download = `${name}.stl`
  link.click()
}

export const Demo = () => {
  const [options, setOptions] = useState<StampOptions>({})

  const solids: Geom3 | undefined = useMold(options)
  const [[handleSolids]] = [useStamp(options)]
  const [stampEnabled, setStampEnabled] = useState(true)
  const [moldEnabled, setMoldEnabled] = useState(false)

  return (
    <div className="flex flew-row flex-wrap items-center ">
      <div className="flex, flex-column">
        <DataInput value={options} setValue={setOptions} />
        <div className="flex flex-row gap-2 m-2">
          <button
            className="btn btn-primary"
            onClick={() => setStampEnabled(e => !e)}
          >
            {stampEnabled ? "Hide" : "Show"} stamp
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setMoldEnabled(e => !e)}
          >
            {moldEnabled ? "Hide" : "Show"} mold
          </button>
          <button
            className="btn btn-outline"
            onClick={() => solids && downloadGeometry(solids, "mold")}
          >
            Download mold
          </button>
          <button
            className="btn btn-outline"
            onClick={() =>
              handleSolids && downloadGeometry(handleSolids, "stamp")
            }
          >
            Download stamp
          </button>
        </div>
      </div>
      <div className="w-[600px] h-[600px]">
        <Renderer
          animate={true}
          solids={[
            stampEnabled ? handleSolids : undefined,
            moldEnabled ? solids : undefined,
          ]}
          height={600}
          width={600}
          options={{
            gridOptions: { show: true, ticks: [10] },
            axisOptions: { show: true },
          }}
        />
      </div>
    </div>
  )
}
