import * as React from "react"
import { Group } from "@visx/group"
import { Pie } from "@visx/shape"
import { Text } from "@visx/text"

export interface PieChartData {
  label: string
  value: number
  color: string
}

interface PieChartLabelProps {
  data: PieChartData[]
  width?: number
  height?: number
}

export function PieChartLabel({ data, width = 320, height = 220 }: PieChartLabelProps) {
  const radius = Math.min(width, height) / 2
  const centerY = height / 2
  const centerX = width / 2

  return (
    <svg width={width} height={height}>
      <Group top={centerY} left={centerX}>
        <Pie
          data={data}
          pieValue={d => d.value}
          outerRadius={radius}
          innerRadius={radius - 40}
          padAngle={0.01}
        >
          {pie => pie.arcs.map((arc, i) => {
            const [centroidX, centroidY] = pie.path.centroid(arc)
            const arcData = arc.data
            return (
              <g key={`arc-${arcData.label}`}>
                <path d={pie.path(arc) || ""} fill={arcData.color} />
                <Text
                  x={centroidX}
                  y={centroidY}
                  dy=".33em"
                  fontSize={12}
                  textAnchor="middle"
                  fill="#fff"
                >
                  {arcData.label}
                </Text>
              </g>
            )
          })}
        </Pie>
      </Group>
    </svg>
  )
} 