<template>
  <div class='map-chart-container'>
    <div class='chart-name chart-name-right'>{{name}}</div>
		<div id = 'tooltip' style = 'position:absolute'></div>
      <div v-bind:id='id' class='map-container'>
   
      </div>
  </div>
</template>

<script>

const d3 = require('d3');

import DataProvider from '../DataProvider';
import * as dsv from 'd3-dsv';

const props = {
  id: {
    type: String,
    default: () => 'map-chart-container',
	},
	name:{
    type:String,
    default:() => '绵阳市',
  },
  top:{
    type: Number,
    default: () => 0,
  },
  left:{
    type: Number,
    default: () => 0,
  },
  width:{
    type: Number,
    default: () => 700,
  },
  height:{
    type:Number,
    default: () => parseInt(window.innerHeight),
  }

};

export default{
    name:'map-view',
    props,
    data () {
        return {
            map_data: {},
            call_records_data:{},
            trajectory_data:{},
						dataset:[]

        }
    },
    mounted:function(){
        this.$root.$on('HourSelected', (hour) => {

					//console.log('on')

					this.updateMapbyHistogram(hour)
					
				})
				
				
				this.$root.$on('HourDaySelected', (m) => {

					//console.log('on')

          this.updateMapbyMatrix(m)

				})

				this.$root.$on('days', (n) => {

					//console.log(n)

          this.updateMapBytimeLine(n)

				})


        d3.select(d3.select('#' + this.id).node().parentNode)
                .style('top', this.top + 'px')
                .style('left', this.left + 'px')


        DataProvider.getTrajectoryCsv().then( TrajectoryResponse =>{

            DataProvider.getCallRcordsCsv().then( CallRecordsResponse =>{
            
                DataProvider.getMapJson().then( MapResponse => {
            
                    let callRecordsdata = dsv.csvParse(CallRecordsResponse.data);

                    let trajectorydata = dsv.csvParse(TrajectoryResponse.data);

										let mapdata = MapResponse.data;
										
										//console.log(this)

                    this.call_records_data = callRecordsdata;

                    this.trajectory_data = trajectorydata;

                    this.map_data = mapdata;

                    this.MapChartInit(this.call_records_data,this.map_data,this.trajectory_data);

                 })
            })
        })

    },

    watch:{

    },

    methods:{

        MapChartInit(){

				  var that = this;
          var zoom = d3.zoom()
        		 .scaleExtent([1, 200])
						 .on("zoom", zoomed);

				  this.scale = 1
						 
        	function zoomed() {

							that.container.attr("transform", "translate(" + 
								d3.event.transform.x + ","+ 
								d3.event.transform.y +")scale(" + 
								d3.event.transform.k + ")");

        			d3.selectAll('.location').attr('r', 4 / d3.event.transform.k)
            	d3.selectAll(".personLine").attr("stroke-width", 3 / d3.event.transform.k)
							that.scale = d3.event.transform.k; //调用zoomed函数时scale才会有定义
							
        	}

        	var map_container = d3.select('#' + this.id)
							.append("svg")
							.attr("width", this.width)
							.attr("height", this.height)
							.append("g")
							.call(zoom);

        	//定义地图投影
        	var projection = d3.geoMercator()
							.center([104, 31])
							.scale(12000)
							.translate([this.width / 2-200 , this.height / 2 +120]);

        	//定义路径
        	var path = d3.geoPath()
        		 	.projection(projection);
				
					this.container = map_container.append("g");
					
					this.tooltip = d3.select('#tooltip')
					//let tooltip = document.getElementById('tooltip')
			
					//开始加载地图
					var regionGroups = this.container.append("g")

					regionGroups.selectAll("path")
							.data(this.map_data.features)
							.enter()
							.append("path")
							.attr("class", "province")
							.style("fill", "steelblue")
							.attr("d", path);
                
          for (let i = 0; i < this.trajectory_data.length; i++) {

							const date = new Date(this.trajectory_data[i].begin_date)

							this.trajectory_data[i].count = date.getTime();
							this.trajectory_data[i].month = date.getMonth();
							this.trajectory_data[i].date = date.getDate();
							this.trajectory_data[i].days = this.trajectory_data[i].month * 31 + this.trajectory_data[i].date;
							this.trajectory_data[i].hour = date.getHours();
							this.trajectory_data[i].day = date.getDay();
				
          }
			
					this.trajectory_data = this.trajectory_data.sort(function(a,b){return a.count - b.count})

            //将数据根据对应的天数存入
					var dayGroup = {};
					for (let i = 0; i < this.trajectory_data.length; i++) {

							let key = this.trajectory_data[i].days;
							let location = projection([this.trajectory_data[i].lon, this.trajectory_data[i].lat]);
							if (dayGroup[key] == undefined)
								dayGroup[key] = [];
						
							dayGroup[key].push({
								'x': location[0],
								'y': location[1]
							})
							
					}
           
					for (let day in dayGroup) {
			
							let meta = {
								'day': day,
								'points': dayGroup[day]
							}
			
							this.dataset.push(meta)
					}//将字典转换为数组
			
					this.linesGroup = this.container.append("g");
					this.DrawLine(this.dataset)
					var circlesGroup = this.container.append("g");
					
					circlesGroup.selectAll(".location")
						 	.data(this.trajectory_data)
				     	.enter()
				     	.append("circle")
				     	.attr("class", "location")
							.attr("transform", function(d) {

								var coor = projection([d.lon, d.lat]);
								return "translate(" + coor[0]+ "," + coor[1] +")";
							})
              .attr("r", 4)
							.attr("fill", "red")
							.on("mouseover",function(d){
								that.tooltip.html("lon:" + d.lon + "<br />" + "lat:" + d.lat)
											 .style("left", (d3.event.pageX) + "px")
											 .style("top", (d3.event.pageY + 20) + "px")
											 .style("opacity", 1);
							})
							.on("mousemove",function(d){
								that.tooltip.style("left", (d3.event.pageX) + "px")
											 .style("top", (d3.event.pageY + 20) + "px");
							})
							.on("mouseout",function(d){
								that.tooltip.style("opacity", 0);
							})
                  
				},
 
        //画线
				DrawLine(data){

					var that = this;
					var tooltip = d3.select('#tooltip')
					let linePath = d3.line()
							.x(function(d) {
								return d.x;
							})
							.y(function(d) {
								return d.y;
							})

					this.linesGroup.selectAll(".personLine") //选择<svg>中所有的<path>
							.data(data) //绑定数据
							.enter() //选择enter部分
							.append("path") //添加足够数量的<path>元素
							.attr("class", "personLine")
							.attr("d", function(d) {
								return linePath(d.points); //返回线段生成器得到的路径
							})
							.attr("fill", "none")
							.attr("stroke-width", 2 / this.scale)
							.attr("stroke-opacity", 0.3)
							.attr("stroke", "black") 
							.on("mouseover", function(d, i) {

								tooltip.html("day:" + d.day)
									.style("left", (d3.event.pageX) + "px")
									.style("top", (d3.event.pageY + 20) + "px")
									.style("opacity", 1.0);
						
								d3.selectAll(".personLine")
									.attr("stroke-opacity", 0.10)
									.attr("stroke", "steelblue")
						
								d3.select(this)
									.attr("stroke-opacity", 1.0)
									.attr("stroke", "#EB4F22")
						
								d3.selectAll("circle")
									.attr("opacity", 0)
						
								that.container.selectAll("highlight_points")
									.data(d.points)
									.enter()
									.append('circle')
									.attr('class', 'highlight_points')
									.attr('cx', q => q.x)
									.attr('cy', q => q.y)
									.attr("fill", '#FFF587')
									.attr('r', 3 / that.scale)
									.attr("opacity", 1)
							})
							.on("mousemove", function(d) {
											
							  	tooltip.style("left", (d3.event.pageX) + "px")
									.style("top", (d3.event.pageY + 20) + "px");
							})
							.on("mouseout", function(d) {
						
								  tooltip.style("opacity", 0.0);
						
									d3.selectAll(".personLine")
									.attr("stroke-opacity", 0.5)
									.attr("stroke", "black")
						
						
									d3.selectAll("circle")
									.attr("opacity", 1.0)
						
									d3.selectAll('.highlight_points').remove()
						
							});

				},

        //直方图的地图更新
        updateMapbyHistogram (hour) {

          d3.selectAll('circle')
            	.attr('opacity', function(d){

              	return d.hour == hour ? 1 : 0
            	})

					d3.select('#' + this.id).selectAll('.personLine').remove()
					//console.log("123")
					
				},
					
				/*矩阵图的地图更新*/
        updateMapbyMatrix(m) {

					d3.selectAll('circle')
            	.attr('opacity', function(d){

              	return d.hour == m.hours && d.day == m.day ? 1 : 0
              })

					d3.select('#' + this.id).selectAll('.personLine').remove()

					//this.DrawLine(m);
				
				},
					
        /*时间轴的地图更新*/
				updateMapBytimeLine(n){

					//var that = this;
						
					d3.selectAll('circle')
            	.attr('opacity', function(d){
								 if(d.days >= n[0] && d.days <= n[1]){
								 	return 1
							   }
							   else{
									return 0
							   }
              })
					d3.select('#' + this.id).selectAll('.personLine').remove()

					let selecedPoints = [];
					for(let i=0;i<this.dataset.length;i++){
						  if(this.dataset[i].day >=n[0] && this.dataset[i].day <=n[1]){
								selecedPoints.push(this.dataset[i])
						  }
					}

				 this.DrawLine(selecedPoints);

			 }

    }
}
</script>
<style lang="css">


.map-chart-container{
  
  position:absolute;
}

.province {
			stroke: black;
			stroke-width: 1px;
}


</style>