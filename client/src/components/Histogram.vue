<template>
<div class='histogram-chart-container'>
      <div class='chart-name chart-name-right'>{{name}}</div>
      <div v-bind:id='id' class='histogram-container'>
   
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
    default: () => 'histogram-chart-container',
  },
  name:{
    type: String,
    default: () => '直方图',
  },
  top:{
    type: Number,
    default: () => 330,
  },
  right:{
    type: Number,
    default: () => 50,
  },
  width:{
    type: Number,
    default: () => 500,
  },
  height:{
    type:Number,
    default: () => 400,
  }

};

export default {
    
    name:'histogram-chart',
    props,
    data(){
        return{
            histogram_data:{}
        }
    },
    mounted:function(){


        d3.select(d3.select('#' + this.id).node().parentNode)
                .style('top', this.top + 'px')
                .style('right', this.right + 'px')

        DataProvider.getCallRcordsCsv().then( response => {

            let callRecordsdata = dsv.csvParse(response.data);

            this.call_records_data = callRecordsdata

            this.chartInit(this.call_records_data);

        })

    },

    watch:{

      // data(){

      //   function(prevValue, nextValue){

      //     if (prevValue != nextValue){

      //       update()
      //     }
      //   }
      // }

    },

    methods:{

        chartInit(){

            let that = this

            this.tooltip = d3.select('#tooltip')

            var padding = {top:30, right:30, bottom:30, left:30};

            var histogram_container = d3.select('#' + this.id)		//matrix_container	
										.append("svg")		
										.attr("width", this.width)	
                                        .attr("height", this.height);
                                        
            var dataset = [];
            for(var i=0;i<this.call_records_data.length;i++){
                this.call_records_data[i].begin_date = new Date(this.call_records_data[i].begin_date);  //将数据转换成时间格式
                dataset.push(this.call_records_data[i].begin_date.getHours());      //提取hour     
                }
            
                   
            var rectNum = 24;      //刻度的数量     
            var rangeMin = 0;
            var rangeMax = 24;
            
            
            var xAxisWidth = 500;
            
            var padding = {top:30, right:30, bottom:30, left:30};
            
            //定义x轴比例尺			
            let x = d3.scaleLinear()
                .domain(d3.extent(dataset)).nice()
                .range([0, xAxisWidth])

            var histogram = d3.histogram()  //直方图布局
                              .domain(x.domain())
                              .thresholds(x.ticks(20))
                                
            var hisData = histogram(dataset);
                        
             //获取刻度
            var xTicks = hisData.map(function(d){return d.x0;})

            var xScale = d3.scaleBand()
                        .domain(xTicks)
                        //中间留0.1的缝隙
                        .rangeRound([padding.left,xAxisWidth-padding.right])
                        .padding(0.1);

            var yAxisWidth = 400;
            var yScale = d3.scaleLinear()
                            .domain([d3.min(hisData,function(d){return d.length;}),
                                    d3.max(hisData,function(d){return d.length;}) ])
                            .range([yAxisWidth-padding.bottom,padding.top]);
            //绘制x轴					
            var xAxis = d3.axisBottom()
                        .scale(xScale)
                        .tickValues(xScale.domain().filter(function(d, i) { return !(i % 3); }))
                        //.tickFormat(d3.format(".0f"));
                        
            histogram_container.append("g")
                .attr("class","axis")
                .attr("transform","translate("+0+","+(yAxisWidth - padding.bottom)+")")
                .call(xAxis);
            //绘制y轴	
            var yAxis = d3.axisLeft()
                        .scale(yScale)
                        .tickFormat(d3.format(".0f"));
            
            histogram_container.append("g")
                .attr("class","axis")
                .attr("transform","translate("+padding.left+","+0+")")
                .call(yAxis)

            histogram_container.selectAll('.axis').selectAll('path').attr('stroke','white').attr('opacity','0.5')
			      histogram_container.selectAll('.axis').selectAll('line').attr('stroke','white').attr('opacity','0.5')
			      histogram_container.selectAll('.axis').selectAll('text').attr('fill','white').attr('opacity','0.5')
                
                
            var hisRect = histogram_container.append("g")
                            .style("opacity",0.5);
                            
            hisRect.selectAll("rect")
                    .data(hisData)
                    .enter()
                    .append("rect")
                    .attr("class","rect")
                    .attr("x",function(d,i){
                        return xScale(d.x0);
                    })
                    .attr("y", d => yScale(d.length))
                    .attr("width",function(d,i){
                        return xScale.bandwidth();
                    })
                    .attr("height", d => yScale.range()[0]-yScale(d.length))
                    .attr("fill","steelblue")
                    .on("click",function(d,i){

                      that.$root.$emit('HourSelected', d.x0)
					  
                    })
                    .on('mouseover', function(d){
                      that.tooltip.html("time:" + d.x0 )
											 .style("left", (d3.event.pageX) + "px")
											 .style("top", (d3.event.pageY + 20) + "px")
											 .style("opacity", 1);
                      d3.select(this).transition().attr('fill','red')
                    })
                    .on("mousemove",function(d){
                      that.tooltip.style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY + 20) + "px");
                    })
                    .on('mouseout', function(d){
                      that.tooltip.style("opacity", 0);
                      d3.select(this).transition().attr('fill','steelblue')
                    })

        

        }

    },
}
</script>
<style lang="css">


.histogram-chart-container{
  
  position:absolute;
}


</style>