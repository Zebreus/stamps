import { useMold } from "functions/useMold"
import dynamic from "next/dynamic"

const Renderer = dynamic(
  () => import("jscad-react").then(mod => mod.Renderer),
  {
    ssr: false,
  }
)

export const Demo = () => {
  const solids = [useMold()]

  return (
    <div>
      <Renderer
        animate={true}
        solids={solids}
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
