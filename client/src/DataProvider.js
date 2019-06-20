import axios from 'axios';

export default class DataProvider {
    static getCountyJson() {

        return axios.get('http://localhost:3001/regions');
    }
    static getRegionJson() {

        //console.log(data)

        return axios.get('https://raw.githubusercontent.com/longwosion/geojson-map-china/master/geometryCouties/510700.json');
    }
    static getItemGroupCsv() {

        return axios.get('http://localhost:3001/groupitem');
    }
    static getTrajectoryCsv() {

        return axios.get('https://raw.githubusercontent.com/zly636600/changhong_healthcare/master/client/src/data/trajectory.csv');
    }
    static getCallRcordsCsv() {

        return axios.get('https://raw.githubusercontent.com/zly636600/changhong_healthcare/master/client/src/data/call_records.csv');
    }
    // static getCallRcordsCsv() {

    //     return axios.get('./data/call_records.csv');
    // }
    static getMapJson() {

        return axios.get('https://raw.githubusercontent.com/zly636600/changhong_healthcare/master/client/src/data/%E7%BB%B5%E9%98%B3%E5%B8%82.json');
    }
    // static getpigjiangCsv(){
    //     return axios.get('./data/pigjiang.csv')
    // }

}