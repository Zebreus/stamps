// @ts-expect-error: No types available
import { solidsAsBlob } from "@jscad/io"
import { Geom3 } from "@jscad/modeling/src/geometries/types"
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
  const solids = [useMold()]
  const [[handleSolids]] = [useStamp()]
  const [stampEnabled, setStampEnabled] = useState(false)
  const [moldEnabled, setMoldEnabled] = useState(true)

  return (
    <div>
      <button onClick={() => setStampEnabled(e => !e)}>Toggle stamp</button>
      <button onClick={() => setMoldEnabled(e => !e)}>Toggle mold</button>
      <button
        className="border"
        onClick={() => solids[0] && downloadGeometry(solids[0], "mold")}
      >
        Download mold
      </button>
      <button
        className="border"
        onClick={() => handleSolids && downloadGeometry(handleSolids, "stamp")}
      >
        Download stamp
      </button>
      <Renderer
        animate={false}
        solids={[
          stampEnabled ? handleSolids : undefined,
          moldEnabled ? solids : undefined,
        ]}
        height={500}
        width={500}
        options={{
          gridOptions: { show: true, ticks: [10] },
          axisOptions: { show: true },
        }}
      />
    </div>
  )
}
