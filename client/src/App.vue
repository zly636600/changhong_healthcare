<template>
  <div id="app">
    <div style='z-index:999' class="float-layer left-float-layer">
        <map-view/>
        <time-line/>

    </div>

    <div class="float-layer right-float-layer">
      
      <matrix
          width=550
          height=250
        
      />
      <histogram/>
      
    
    
    </div>  

  </div>

</template>

<script>

//import SyouMapboxView from './components/SyouMapboxView';

////////////////////////////////////////////////////
// import SyouPieChart from './components/SyouPieChart';
// import SyouLineChart from './components/SyouLineChart';
// import SyouGaugeChart from './components/SyouGaugeChart';
// import SyouRatioChart from './components/SyouRatioChart';
// import SyouGroupBarChart from './components/SyouGroupBarChart';
// import FixedAttrIndicator from './components/FixedAttrIndicator';
// //import DynamicAttrIndicator from './components/DynamicAttrIndicator';
// //import SyouBubbleFrequencyChart from './components/SyouBubbleFrequencyChart';
// import SyouGroupPieChart from './components/SyouGroupPieChart';
// import SyouVerticalBarChart from './components/SyouVerticalBarChart';
// import SyouTickDashChart from './components/SyouTickDashChart';
import DataProvider from './DataProvider';
import Matrix from './components/Matrix';
import MapView from './components/MapView';
import Histogram from './components/Histogram';
import TimeLine from './components/TimeLine';

export default {
  name: 'App',
  components: {
    // SyouPieChart,
    // SyouLineChart,
    // SyouGaugeChart,
    // SyouRatioChart,
    // SyouGroupBarChart,
    // SyouGroupPieChart,
    // SyouVerticalBarChart,
    // FixedAttrIndicator,
    // SyouTickDashChart,
    Matrix,
    MapView,
    Histogram,
    TimeLine,
  },
  data () {
    return {
      bubbleData: {}
    }
  },
  mounted: function() {

    DataProvider.getItemGroupCsv().then(response => {

          //this data is bind with the instance of component
          this.bubbleData = response.data
          
        }, error => {

          console.log('unable to get data')
        });

  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}

.float-layer {
  position: absolute;
  z-index:998;
  width:25%;
  height:100%;

}

.left-float-layer{

  left:0px;
}

.right-float-layer{

  right:0px;
}


body {
    margin:0; 
    padding:0;
    width:100%;
    height:100%;
    background:black
}

.chart-name{
    color:white; 
    margin-bottom:30px;
    border-top: 3px solid #F0B04D;
    background: rgba(255,255,255,0.1);
    padding:10px;
}

.chart-name-right{

    float:right; 
    right:10px;
    margin: 0%;
  
}

.chart-name-left{

    float:left; 
    left:10px; 
    margin: 0%;

}

#tooltip{
		position:absolute;
		width:120;
		height:auto;
		font-family:serif;
		font-size:14px;
		text-align:left;
		border-style:solid;
		border-width:1px;
		background-color:white;
		border-radius:5px;
	}
</style>
