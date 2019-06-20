<template>
<div class='matrix-chart-container'>
      <div class='chart-name chart-name-right'>{{name}}</div>
      <div v-bind:id='id' class='matrix-container'>
   
      </div>
  </div>
</template>

<script>
 
const d3 = require('d3');

import * as dsv from 'd3-dsv'

import DataProvider from '../DataProvider';

const props = {
  id: {
    type: String,
    default: () => 'matrix-chart-container',
  },
  name:{
    type: String,
    default: () => '矩阵图',
  },
  top:{
    type: Number,
    default: () => 20,
  },
  right:{
    type: Number,
    default: () => 20,
  },
  width:{
    type: Number,
    default: () => 550,
  },
  height:{
    type:Number,
    default: () => 250,
  }

};

export default{

    name:'matrix-chart',
    props,
    data () {
        return {
            call_records_data: {}
        }
    },
    mounted:function(){

							DataProvider.getCallRcordsCsv().then( response => {

							let callRecordsdata = dsv.csvParse(response.data);

							this.call_records_data = callRecordsdata

							this.chartInit(this.call_records_data);

							d3.select(d3.select('#' + this.id).node().parentNode)
									.style('top', this.top + 'px')
									.style('right', this.right + 'px')
        
              })
            },

    watch:{

    },

    methods:{

    	chartInit(){                 
			
				var padding = {top:30, right:30, bottom:30, left:30};
				
				var matrix_container = d3.select('#' + this.id)		//matrix_container	
									.append("svg")		
									.attr("width", this.width)	
									.attr("height", this.height);
									
				var matrix_data = []
				var cellSize = 17;
				for(i=0;i<7;i++){
							var meta = []          //构建7*24的二维数组，将里面的值全定义为0
							for(j=0;j<24;j++){
								meta.push(0)
							}
							matrix_data.push(meta)
				};
					
					//将通话记录的次数根据对应的时刻和星期存入二维数组
				for(var i=0;i < this.call_records_data.length;i++){
					
							this.call_records_data[i].begin_date = new Date(this.call_records_data[i].begin_date);
							//获取星期值和时刻值
							var m = this.call_records_data[i].begin_date.getDay(); 
							var n = this.call_records_data[i].begin_date.getHours();
							matrix_data[m][n]++;
					}

					
				let minHeat = d3.min(d3.min(matrix_data))
				let maxHeat = d3.max(d3.max(matrix_data))
				var linear = d3.scaleLinear()
							.domain([minHeat,maxHeat])
							.range([0,1]);
									
				var mat = []
					//定义二维数组，将day hour heat存入数组
				for (var i=0;i<matrix_data.length;i++){
						
					for(var j=0;j<matrix_data[i].length;j++){
							
							var ele = {'day':i,'hours':j,'heat':matrix_data[i][j]};
							mat.push(ele);
					}
				}
					
				var rectGroup = matrix_container.append("g")  //rectGroup, rectContainer
							.style("opacity",1.0);	

				this.tooltip = d3.select('#tooltip')

				var that = this;
												
				rectGroup.selectAll("rect")
							.data(mat)
							.enter()
							.append("rect")
							.attr("class","rect")
							///留3的间隙
							.attr("x",function(d,i){
								return d.hours*(cellSize+3)+padding.left;
							})
							.attr("y",function(d,i){
								return d.day*(cellSize+3)+padding.top ;
							})
							.attr("width",cellSize)
							.attr("height",cellSize)
							.attr("fill", 'steelblue')
							.attr("opacity", d => linear(d.heat))
							.on("click",function(d,i){
										//调用map.js中的地图更新
									//	map.updateMapbyMatrix(d.hours,d.day);
										that.$root.$emit('HourDaySelected', d)
							})
							.on('mouseover', function(d){
								that.tooltip.html("day:" + d.day + "<br />" + "time:" + d.hours )
									.style("left", (d3.event.pageX) + "px")
									.style("top", (d3.event.pageY + 20) + "px")
									.style("opacity", 1);
								d3.select(this).transition().attr('fill','red').attr("opacity",1)
							})
							.on("mousemove",function(d){
								that.tooltip.style("left", (d3.event.pageX) + "px")
									.style("top", (d3.event.pageY + 20) + "px");
							})
							.on('mouseout', function(d){
								that.tooltip.style("opacity", 0);
								d3.select(this).transition().attr('fill','steelblue').attr("opacity",d => linear(d.heat))
							})
		
					//定义矩阵图的坐标轴
				var	axisHeight = 6*(cellSize+3)+cellSize;
				var	axisWidth = 23*(cellSize+3)+cellSize;
					
				let xAxisScale = d3.scaleLinear()
							.domain([0,24])
							.range([0,axisWidth])
									
				let xAxis = d3.axisTop()
							.scale(xAxisScale)
							.ticks(12)
								
				matrix_container.append("g")
							.attr("class","axis")
							.attr("transform","translate("+padding.left+","+padding.top+")")
							.call(xAxis);
						
				let yAxisScale = d3.scaleLinear()
							.domain([0,7])
							.range([0,axisHeight])
									
				let yAxis = d3.axisLeft()
							.scale(yAxisScale)
							.tickValues([0,1,2,3,4,5,6]);
							
				matrix_container.append("g")
					.attr("class","axis")
							.attr("transform","translate("+padding.left+","+padding.top+")")
							.call(yAxis);
				
				matrix_container.selectAll('.axis').selectAll('path').attr('stroke','white').attr('opacity','0.5')
				matrix_container.selectAll('.axis').selectAll('line').attr('stroke','white').attr('opacity','0.5')
				matrix_container.selectAll('.axis').selectAll('text').attr('fill','white').attr('opacity','0.5')
				
				//创建渐变	
				var defs = matrix_container.append("defs");
				
				var linearGradient = defs.append("linearGradient")
							.attr("id","linearColor")
							//x1,x2,y1,y2定义渐变方向为水平渐变
							.attr("x1","0%")
							.attr("y1","0%")
							.attr("x2","100%")
							.attr("y2","0%");
				
				var minColor = linearGradient.append("stop")
							.attr("offset","0%")
							.style("stop-color",'black')
							
				
				var maxColor = linearGradient.append("stop")
							.attr("offset","100%")
							.style("stop-color", 'steelblue')
			
				//添加一个矩形，并应用线性渐变
				var colorRect = matrix_container.append("rect")
							.attr("x", padding.left)
							.attr("y", padding.top+axisHeight+50)
							.attr("width", 140)
							.attr("height", 30)
							.style("fill","url(#linearColor)")			
				
				//添加文字
				var minValueText = matrix_container.append("text")
							.attr("class","valueText")
							.attr("x", padding.left)
							.attr("y", padding.top+axisHeight+50)
							.attr("dy", "-0.3em")
							.attr("fill","white")
							.attr("opacity","0.5")
							.text("0");
				
				var maxValueText = matrix_container.append("text")
							.attr("class","valueText")
							.attr("x", padding.left+140)
							.attr("y", padding.top+axisHeight+50)
							.attr("dy", "-0.3em")
							.attr("fill","white")
							.attr("opacity","0.5")
							.text("10");

      }
    },
}
</script>
<style lang="css">

.matrix-chart-container{
  
  position:absolute;
}


</style>

