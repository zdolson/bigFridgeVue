<template>
  <div id="app">
      <div class="nav">
          <p class="proj-title">Big Fridge</p>
          <div class="search-bar">
              <span
                class="icon"
                ><i
                    class="fa fa-search"
                    style="color:black;"
                ></i>
              </span>
              <input
                type="text"
                v-model.lazy="searchQuery"
                placeholder="Name, Store, Type...">
          </div>
          <button
            class="clear-filter"
            @click="clearAllFilters"
            >Clear Filters <i
                class="fas fa-filter"
            ></i>
          </button>
          <span class="caution-span"><b>Caution: {{numExpired}} items have expired!</b></span>
      </div>
      <div class="container" id="infScroll">
          <component
            v-if="currentTab=='searchbar'"
            :is="currentTabComponent"
            :inputArray="sliced"
            :clear="wipeChildState"
            class="tab"
            @apply-filter="processFilterEvent($event)"
            @apply-sort="processSortEvent($event)"
            @apply-aggregate="processAggregate()"
            @wiped-states="wipeChildState = false"
          ></component>
      </div>
  </div>
</template>
<script>
import Vue from 'vue'

import d0 from './data/data-0.json'
import d1 from './data/data-1.json'
import d2 from './data/data-2.json'
import d3 from './data/data-3.json'
import d4 from './data/data-4.json'
import d5 from './data/data-5.json'
import d6 from './data/data-6.json'
import d7 from './data/data-7.json'
import d8 from './data/data-8.json'
import d9 from './data/data-9.json'

import { library, dom } from '@fortawesome/fontawesome-svg-core'
import {
    faCoffee, faSkull, faSearch, faThumbsUp, faSort, faFilter, faPlus,
    faSortAlphaUp, faSortAlphaDown, faSortNumericUp, faSortNumericDown,
    faSlash
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(
    faCoffee, faSkull, faSearch, faThumbsUp, faSort, faSortAlphaUp,
    faSortAlphaDown, faSortNumericUp, faSortNumericDown, faFilter,
    faPlus, faSlash
);
dom.watch();

var fridge = [];
var aggregationObject = {};
var filterObject = {
    'filterOrder': []
};
var currentTab = 'searchbar';
var searchResult = [];
var searchQuery = '';
var numExpired = 0;
var display = 100;
var nameSet = new Set();
var storeSet = new Set();
var typeSet = new Set();
var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
var reverseFlags = {};
var wipeChildState = false;
var aggregateFlag = false;

export default {
  name: 'app',
  components: {
      'font-awesome-icon': FontAwesomeIcon,
      'tab-searchbar': () => import('./components/TableView'),
  },
  data: function() {
      return {
          fridge,
          filterObject,
          searchResult,
          searchQuery,
          currentTab,
          numExpired,
          nameSet,
          storeSet,
          typeSet,
          searchIcon: '\uf002',
          display,
          reverseFlags,
          wipeChildState,
          aggregateFlag,
          aggregationObject,
      }
  },
  created: function() {
      let files = [d0, d1, d2, d3, d4, d5, d6, d7, d8, d9];
      for (let file of files){
          for (let item of file){
              let parsedPurchaseDate = {
                  year: item.purchaseDate.substring(0,4),
                  month: item.purchaseDate.substring(5,7),
                  day: item.purchaseDate.substring(8,10),
                  ymd: item.purchaseDate.substring(0,10),
              }
              let parsedExpirationDate = {
                  year: item.expirationDate.substring(0,4),
                  month: item.expirationDate.substring(5,7),
                  day: item.expirationDate.substring(8,10),
                  ymd: item.expirationDate.substring(0,10),
              }
              let expiredFlag = false;
              let yearCheck = parsedPurchaseDate.year > parsedExpirationDate.year;
              let monthCheck = parsedPurchaseDate.month > parsedExpirationDate.month;
              let dayCheck = parsedPurchaseDate.day > parsedExpirationDate.day;
              if (yearCheck){
                  expiredFlag = true;
                  this.numExpired++;
              }else if (
                  parsedPurchaseDate.year == parsedExpirationDate.year &&
                  monthCheck
              ){
                  expiredFlag = true;
                  this.numExpired++;
              }else if (
                  parsedPurchaseDate.year == parsedExpirationDate.year &&
                  parsedPurchaseDate.month == parsedExpirationDate.month &&
                  dayCheck
              ){
                  expiredFlag = true;
                  this.numExpired++;
              }
              this.fridge.push({
                  name: item.name,
                  type: item.type,
                  store: item.store,
                  purchaseDate: item.purchaseDate.substring(0,10),
                  expirationDate: item.expirationDate.substring(0,10),
                  quantity: item.quantity,
                  expired: expiredFlag
              });
              nameSet.add(item.name.toLowerCase());
              storeSet.add(item.store.toLowerCase());
              typeSet.add(item.type.toLowerCase());
              if (!this.aggregationObject.hasOwnProperty(parsedPurchaseDate.ymd)){
                  this.aggregationObject[parsedPurchaseDate.ymd] = {};
                  this.aggregationObject[parsedPurchaseDate.ymd][item.name] = {
                      name: item.name,
                      type: item.type,
                      store: '-',
                      purchaseDate: parsedPurchaseDate.ymd,
                      expirationDate: '-',
                      quantity: item.quantity,
                      expired: '-',
                  }
              } else {
                  if (this.aggregationObject[parsedPurchaseDate.ymd].hasOwnProperty(item.name)){
                      this.aggregationObject[parsedPurchaseDate.ymd][item.name].quantity += item.quantity;
                  } else {
                      this.aggregationObject[parsedPurchaseDate.ymd][item.name] = {
                          name: item.name,
                          type: item.type,
                          store: '-',
                          purchaseDate: parsedPurchaseDate.ymd,
                          expirationDate: '-',
                          quantity: item.quantity,
                          expired: '-',
                      };
                  }
              }
          }
      }
      this.searchResult = this.fridge;
      this.reverseFlags = Object.assign({}, this.reverseFlags, {
          name: false,
          type: false,
          store: false,
          purchaseDate: false,
          expirationDate: false,
          quantity: false,
          expired: false
      })
  },
  mounted: function(){
      document.getElementById('infScroll').addEventListener('scroll', this.scroll);
  },
  destroyed: function(){
      document.getElementById('infScroll').removeEventListener('scroll', this.scroll);
  },
  methods: {
      objectPropsToArray: function(inputObject, currentLevel){
          if (Array.isArray(inputObject)){
              return inputObject;
          }
          if (inputObject.hasOwnProperty('expired')){
              return [inputObject];
          }
          let inputAsArray = [];
          let filterType = this.filterObject['filterOrder'][currentLevel];
          if (this.reverseFlags[filterType]){
              currentLevel++;
              for (let property of Object.keys(inputObject).sort(collator.compare).reverse()){
                  if (!Array.isArray(property)){
                      inputAsArray = inputAsArray.concat(this.objectPropsToArray(inputObject[property], currentLevel));
                  } else {
                      inputAsArray = inputAsArray.concat(inputObject[property]);
                  }
              }
          } else {
              currentLevel++;
              for (let property of Object.keys(inputObject).sort(collator.compare)){
                  if (!Array.isArray(property)){
                      if (Object.values(property))
                      inputAsArray = inputAsArray.concat(this.objectPropsToArray(inputObject[property], currentLevel));
                  } else {
                      inputAsArray = inputAsArray.concat(inputObject[property]);
                  }
              }
          }
          return inputAsArray;
      },
      clearAllFilters: function(){
          this.filterObject['filterOrder'].splice(0);
          this.searchQuery = '';
          this.display = 100;
          this.wipeChildState = true;
          this.aggregateFlag = false;
          this.sliced = this.fridge;
      },
      processAggregate: function(){
          this.aggregateFlag = true;
      },
      processSortEvent: function(inputEvent){
          this.reverseFlags[inputEvent.from] = (inputEvent.state == 0) ? true:false;
      },
      processFilterEvent: function(inputEvent){
          if (this.filterObject['filterOrder'].length == 0){
              this.filterObject['filterOrder'] = [inputEvent];
              return;
          } else {
              for (let i of this.filterObject['filterOrder']){
                  if (inputEvent == i){
                      return;
                  }
              }
              this.filterObject['filterOrder'].push(inputEvent);
          }
      },
      broadFilter: function(inputArray, particularFilter){
          let filteredObject = {};
          if (Array.isArray(inputArray)){
              for (let item of inputArray){
                  if (!filteredObject.hasOwnProperty(item[particularFilter])){
                      filteredObject[item[particularFilter]] = [item];
                  } else {
                      filteredObject[item[particularFilter]].push(item);
                  }
              }
          } else {
              for (let property in inputArray){
                  filteredObject[property] = this.broadFilter(inputArray[property], particularFilter);
              }
          }
          return filteredObject;
      },
      filterManager: function(overrideArray = []){
          let filtered = [];
          let tempFiltered = {};
          let hasBeenFiltered = false;
          let overrideFlag = false;
          let numberFiltersApplied = 0;

          if (overrideArray.length > 0){
              overrideFlag = true;
          }
          if (this.filterObject['filterOrder'].length == 0){
              if (overrideFlag){
                  filtered = overrideArray;
              } else {
                  filtered = this.fridge;
              }
              return filtered;
          }

          while(this.filterObject['filterOrder'].length - numberFiltersApplied > 0){
              let filterType = this.filterObject['filterOrder'][numberFiltersApplied];
              if (!hasBeenFiltered){
                  if (overrideFlag){
                      tempFiltered = this.broadFilter(overrideArray, filterType);
                  } else {
                      tempFiltered = this.broadFilter(this.fridge, filterType);
                  }
                  hasBeenFiltered = true;
              } else {
                  for (let property in tempFiltered){
                      let tempProp = this.broadFilter(tempFiltered[property], filterType);
                      Vue.set(tempFiltered, property, tempProp);
                  }
              }
              numberFiltersApplied++;
          }
          filtered = this.objectPropsToArray(tempFiltered, 0);
          return filtered;
      },
      updateTab: function(newTab){
          this.currentTab = newTab;
      },
      scroll () {
          let element = document.getElementById('infScroll');
          let offset = 300;
          if (element.clientHeight + element.scrollTop >= element.scrollHeight - offset) {
              this.display = this.display + 20;
          }
      },
  },
  computed: {
      sliced: {
          get: function(){
              return this.filterManager(this.searchResult).slice(0, this.display);
          },
          set: function(inputArray){
              this.searchResult = inputArray;
          }
      },
      currentTabComponent: function(){
          return 'tab-' + this.currentTab;
      }
  },
  watch: {
      searchQuery: function(){
          let lowerSQ = this.searchQuery.toLowerCase();
          let searchSubset = {};
          if (lowerSQ.length == 0){
              this.sliced = this.fridge;
          } else if (this.nameSet.has(lowerSQ)){
              for (let item of this.fridge){
                  if (item.name.toLowerCase() == lowerSQ){
                      if (!searchSubset.hasOwnProperty(item.name.toLowerCase())){
                          searchSubset[item.name.toLowerCase()] = [item];
                      } else {
                          searchSubset[item.name.toLowerCase()].push(item);
                      }
                  }
              }
              this.sliced = searchSubset[lowerSQ];
          } else if (this.storeSet.has(lowerSQ)){
              for (let item of this.fridge){
                  if (item.store.toLowerCase() == lowerSQ){
                      if (!searchSubset.hasOwnProperty(item.store.toLowerCase())){
                          searchSubset[item.store.toLowerCase()] = [item];
                      } else {
                          searchSubset[item.store.toLowerCase()].push(item);
                      }
                  }
              }
              this.sliced = searchSubset[lowerSQ];
          } else if (this.typeSet.has(lowerSQ)){
              for (let item of this.fridge){
                  if (item.type.toLowerCase() == lowerSQ){
                      if (!searchSubset.hasOwnProperty(item.type.toLowerCase())){
                          searchSubset[item.type.toLowerCase()] = [item];
                      } else {
                          searchSubset[item.type.toLowerCase()].push(item);
                      }
                  }
              }
              this.sliced = searchSubset[lowerSQ];
          } else {
              // console.log('no matching search item :(');
          }
      },
      aggregateFlag: function(){
          if (this.aggregateFlag){
              this.sliced = this.objectPropsToArray(this.aggregationObject, 0);
          }
      },
  },
}
</script>
<style>
#app {
    width: 100%;
    height: 100%;
    min-height: 800px;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #000;
    background-color: #fafafa;
    margin-bottom: 0;
}
.nav {
    width: 100%;
    height: 50px;
    background-color: #fff;
    border-bottom: 1px solid #c7c7c7;
    padding: 5px 0;
}
.proj-title{
    color: #000;
    display: inline-block;
    float: left;
    margin-left: 30px;
    border-right: 1px solid black;
    padding-right: 6px;
}
.clear-filter{
    margin-top: 16px;
    display: inline-block;
    float: left;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
}
.clear-filter:focus,
.clear-filter:hover{
    background-color: #cfd8dc;
    border: 1px solid #4fc3f7;
    outline: 0;
}
.caution-span{
    margin-top: 14px;
    margin-right: 40px;
    display: inline-block;
    float: right;
    color: #ef5350;
}
.search-bar{
    display: inline-block;
    width: 250px;
    vertical-align: middle;
    margin-top: 8px;
    margin-left: -10px;
    float: left;
    white-space: nowrap;
    position: relative;
}
.search-bar input{
    width: 160px;
    height: 35px;
    background: #eceff1;
    border: none;
    font-size: 10pt;
    color: #63717f;
    padding-left: 35px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
}
.search-bar input:focus,
.search-bar input:hover{
    background-color: #cfd8dc;
    border: 1px solid #4fc3f7;
    outline: 0;
}
.search-bar input::-webkit-input-placeholder {
   color: #65737e;
}
.search-bar input:-moz-placeholder {
   color: #65737e;
}
.search-bar input::-moz-placeholder {
   color: #65737e;
}
.search-bar input:-ms-input-placeholder {
   color: #65737e;
}
.search-bar .icon{
    position: absolute;
    margin-left: 10px;
    margin-top: 9px;
    z-index: 1;
    color: #82b3c9;
}
.tile{
    height: 40px;
    width: 120px;
    margin: 5px 15px;
    display: inline-block;
}
.tile.tab{
    color: #000;
}
.tab{
    height: 780px;
    width: 100%;
    min-height: 600px;
    margin: 0;
    display: inline-block;
}
.container{
    height: 100%;
    width: 100%;
    overflow: auto;
    background-color: #fafafa;
}
.quantity-by-food{
    width: 330px;
    height: 500px;
    overflow: auto;
    display: inline-block;
    vertical-align: top;
    text-align: left;
    border: 1px solid black;
}
.filter-button{
    background: #eeeeee;
    border: none;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;

}
.filter-button:focus,
.filter-button:hover{
    background-color: #cfd8dc;
    border: 1px solid #4fc3f7;
    outline: 0;
}
html,
body {
    margin: 0;
    padding: 0;
}
</style>
