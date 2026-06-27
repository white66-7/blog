<template>
  <div ref="container" class="donut-chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import * as d3 from 'd3'
import gsap from 'gsap'

const props = defineProps<{
  articles: any[]  // 文章数据，用于统计分类
}>()

const container = ref<HTMLElement | null>(null)

function drawDonutChart() {
  const el = container.value
  if (!el) return
  // 清空容器
  d3.select(el).html('')

  const width = el.clientWidth || 400
  const height = width
  const radius = Math.min(width, height) / 2
  const innerRadius = radius * 0.35
  const outerRadius = radius - 10

  // 数据准备：统计各分类文章数量
  const typeMap = new Map<string, number>()
  props.articles.forEach(article => {
    const t = article.type || '未分类'
    typeMap.set(t, (typeMap.get(t) || 0) + 1)
  })
  const data = Array.from(typeMap, ([label, value]) => ({ label, value }))
  const total = props.articles.length

  // 颜色方案
  const nvd3Colors = ['#965251', '#00b3ca', '#7dd0b6', '#e38690', '#ead98b']
  const extraColors = ['#f39c12', '#8e44ad', '#2ecc71', '#e67e22', '#3498db']
  const allColors = [...nvd3Colors, ...extraColors]
  const colorScale = d3.scaleOrdinal<string>()
    .domain(data.map(d => d.label))
    .range(allColors.slice(0, data.length))

  const svg = d3.select(el)
    .append('svg')
    .attr('width', '100%')
    .attr('height', width)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`)

  const pie = d3.pie<any>().value(d => d.value).sort(null)
  const arc = d3.arc<any>().innerRadius(innerRadius).outerRadius(outerRadius)
  const hoverArc = d3.arc<any>().innerRadius(innerRadius).outerRadius(outerRadius + 5)

  // 绘制扇形 + hover 效果
  svg.selectAll('path')
    .data(pie(data))
    .enter().append('path')
    .attr('d', arc)
    .attr('fill', (d: any) => colorScale(d.data.label))
    .attr('stroke', 'rgba(255,255,255,0.2)')
    .attr('stroke-width', 1.5)
    .style('cursor', 'pointer')
    .on('mouseover', function(event, d: any) {
      const brighter = d3.color(colorScale(d.data.label))?.brighter(0.5)?.toString() || colorScale(d.data.label)
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', hoverArc(d))
        .attr('fill', brighter)
    })
    .on('mouseout', function(event, d: any) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', arc(d))
        .attr('fill', colorScale(d.data.label))
        .attr('stroke', 'rgba(255,255,255,0.2)')
        .attr('stroke-width', 1.5)
    })

  // 内部标签：只显示分类名
  svg.selectAll('.label')
    .data(pie(data))
    .enter().append('text')
    .attr('transform', (d: any) => {
      const pos = arc.centroid(d)
      return `translate(${pos[0]}, ${pos[1]})`
    })
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .style('fill', '#fff')
    .style('font-size', '14px')
    .style('font-weight', '500')
    .style('font-family', 'Microsoft YaHei, PingFang SC, Heiti SC, sans-serif')
    .style('text-shadow', '0 1px 4px rgba(0,0,0,0.6)')
    .text((d: any) => d.data.label)

  // 中心文字
  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-.35em')
    .style('fill', '#fff')
    .style('font-size', '22px')
    .style('font-weight', '300')
    .style('font-family', 'Microsoft YaHei, PingFang SC, Heiti SC, sans-serif')
    .text('文章分类')

  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '1.2em')
    .style('fill', '#aaa')
    .style('font-size', '16px')
    .style('font-family', 'Microsoft YaHei, PingFang SC, Heiti SC, sans-serif')
    .text(`${total} 篇`)

  // GSAP 入场动画
  const svgEl = d3.select(el).select('svg').node()
  if (svgEl) {
    gsap.from(svgEl, {
      duration: 0.8,
      rotation: -120,
      scale: 0,
      opacity: 0,
      ease: 'power2.out'
    })
  }
}

// 生命周期：挂载后绘制，数据变化时重绘
onMounted(() => {
  nextTick(() => drawDonutChart())
})

watch(() => props.articles, () => {
  drawDonutChart()
}, { deep: true })
</script>

<style scoped>
.donut-chart-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
.donut-chart-container svg {
  width: 100%;
  height: auto;
}
</style>