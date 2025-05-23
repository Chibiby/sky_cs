import * as React from "react"
import { AreaClosed, LinePath } from "@visx/shape"
import { scaleLinear, scaleTime } from "@visx/scale"
import { curveMonotoneX } from "@visx/curve"
import { Group } from "@visx/group"
import { AxisBottom, AxisLeft } from "@visx/axis"

export interface AreaChartData {
  date: Date
  value: number
}

interface AreaChartProps {
  data: AreaChartData[]
  width?: number
  height?: number
}

export function AreaChart({ data, width = 600, height = 220 }: AreaChartProps) {
  const margin = { top: 20, right: 30, bottom: 40, left: 40 }
  const xMax = width - margin.left - margin.right
  const yMax = height - margin.top - margin.bottom

  const xScale = scaleTime({
    range: [0, xMax],
    domain: [
      Math.min(...data.map(d => d.date.getTime())),
      Math.max(...data.map(d => d.date.getTime())),
    ],
  })
  const yScale = scaleLinear({
    range: [yMax, 0],
    domain: [0, Math.max(...data.map(d => d.value))],
    nice: true,
  })

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <AreaClosed<AreaChartData>
          data={data}
          x={(d: AreaChartData) => xScale(d.date)}
          y={(d: AreaChartData) => yScale(d.value)}
          yScale={yScale}
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.2}
          curve={curveMonotoneX}
        />
        <LinePath<AreaChartData>
          data={data}
          x={(d: AreaChartData) => xScale(d.date)}
          y={(d: AreaChartData) => yScale(d.value)}
          stroke="#6366f1"
          strokeWidth={2}
          curve={curveMonotoneX}
        />
        <AxisLeft scale={yScale} />
        <AxisBottom top={yMax} scale={xScale} />
      </Group>
    </svg>
  )
} 