<template>
    <div class = 'timeLine-chart-container'>
        <div class = 'chart-name chart-name-right'>{{name}}</div>
        <div v-bind:id = 'id' class = 'timeLine-container'>

        </div>
    </div>
</template>

<script>

const d3 = require('d3');

import * as dsv from 'd3-dsv'

import DataProvider from '../DataProvider';

const props = {
    id:{
        type:String,
        default:() => 'timeLine-chart-container',
    },
    name:{
        type:String,
        default:() => '时间轴',
    },
    top:{
        type: Number,
        default: () => 600,
    },
    left:{
        type: Number,
        default: () => 80,
    },
    width:{
        type: Number,
        default: () => 500,
    },
    height:{
        type:Number,
        default: () => 130,
    }
};

export default {

    name:'timeline-chart',
    props,
    data(){
        return {
            trajectory_data: {}
        }
    },
    mounted:function(){


        DataProvider.getTrajectoryCsv().then( response => {

            let trajectorydata = dsv.csvParse(response.data);

            this.trajectory_data = trajectorydata

            this.chartInit(this.trajectory_data);

            d3.select(d3.select('#' + this.id).node().parentNode)
                .style('top', this.top + 'px')
                .style('position', 'absolute')
                .style('left', this.left + 'px')
        
        })

    },

    watch:{

    },

    methods:{

        chartInit(){

            var padding = {top:30, right:30, bottom:30, left:30};

            var timeLine_container = d3.select('#' + this.id)
                                        .append("svg")
                                        .attr("width", this.width)
                                        .attr("height", this.height);

        var dataset = [];
        for (var i = 0; i < this.trajectory_data.length; i++) {
            this.trajectory_data[i].begin_date = new Date(this.trajectory_data[i].begin_date);
            var month = this.trajectory_data[i].begin_date.getMonth();
            var day = this.trajectory_data[i].begin_date.getDate();
            var date = month * 31 + day;
            dataset.push(date);
        }

        var rectNum = 50 //直方图的数量    

        //横坐标轴宽度
        var xAxisWidth = 500;

        let x = d3.scaleLinear()
                    .domain(d3.extent(dataset)).nice()
                    .range([padding.left, xAxisWidth - padding.right])

        var histogram = d3.histogram() //直方图布局
                            .domain(x.domain())
                            .thresholds(x.ticks(58))

        var hisData = histogram(dataset);
        console.log(dataset.extent)
        

        //定义x轴比例尺			
        var xScale = d3.scaleLinear()
            .domain(d3.extent(hisData, d => d.x0))
            .range([padding.left, xAxisWidth - padding.right]);

        var yAxisWidth = 130;
        var yScale = d3.scaleLinear()
            .domain([d3.min(hisData, function(d) {
                    return d.length;
                }),
                d3.max(hisData, function(d) {
                    return d.length;
                })
            ])
            .range([yAxisWidth - padding.bottom, padding.top]);
        //绘制x轴					
        var xAxis = d3.axisBottom()
            .scale(xScale)
            // .tickValues(xScale.domain().filter(function(d, i) { return !(i % 5); }))
            .tickFormat(d3.format(".0f"));

        timeLine_container.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + 0 + "," + (yAxisWidth - padding.bottom) + ")")
            .call(xAxis);

        timeLine_container.selectAll('.axis').selectAll('path').attr('stroke','white').attr('opacity','0.5')
		timeLine_container.selectAll('.axis').selectAll('line').attr('stroke','white').attr('opacity','0.5')
		timeLine_container.selectAll('.axis').selectAll('text').attr('fill','white').attr('opacity','0.5')

        var gRect = timeLine_container.append("g")
            .style("opacity", 1.0);

        gRect.selectAll("rect")
            .data(hisData)
            .enter()
            .append("rect")
            .attr("class", "rect")
            .attr("x", function(d, i) {
                return xScale(d.x0);
            })
            .attr("y", function(d, i) {
                return yScale(d.length);
            })
            .attr("width", function(d, i) {
                return 5;
            })
            .attr("height", function(d){

                return yAxisWidth - padding.bottom - yScale(d.length)
            })
            .attr("fill", "steelblue")
            .attr("opacity","0.7")


        var brush_width = this.width - padding.left - padding.right;
        var brush_height = this.height - padding.top - padding.bottom;

        var that = this;

        var brush = d3.brushX()
            .extent([[0,0],[brush_width,brush_height]])
            .on("end", d=>{

                var ext = d3.event.selection.map(xScale.invert)
                that.$root.$emit('days', ext)
            })

        var brushg = timeLine_container.append("g")
            .attr("class", "brush")
            .call(brush)

        brushg.selectAll("rect")
            .attr("height", brush_height)
            .attr("opacity", 0.3)
            .attr("transform", "translate(" + 0 + "," + padding.bottom + ")")

        }

    },
    
}
</script>

<style lang="css">


.timeline-chart-container{
  
  position:absolute;
}


</style>

