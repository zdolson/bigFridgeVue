<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

var sortStates = {};
var numericFilters = new Set();

export default {
    data: function () {
      return {
          filters: ['name', 'quantity', 'store', 'type', 'purchaseDate', 'expirationDate', 'expired'],
          numericFilters,
          sortNumImgs: ["sort-numeric-up", "sort-numeric-down", "sort"],
          sortAlphaImgs: ["sort-alpha-up", "sort-alpha-down", "sort"],
          sortStates,
      }
    },
    components: {
        'font-awesome-icon': FontAwesomeIcon,
    },
    created: function(){
        this.numericFilters.add('quantity');
        this.numericFilters.add('purchaseDate');
        this.numericFilters.add('expirationDate');
        for (let filter of this.filters){
            if (this.numericFilters.has(filter)){
                this.sortStates = Object.assign({}, this.sortStates, {
                    [filter]: {
                        state: 2,
                        img: this.sortNumImgs[2],
                    }
                })
            } else {
                this.sortStates = Object.assign({}, this.sortStates, {
                    [filter]: {
                        state: 2,
                        img: this.sortAlphaImgs[2],
                    }
                })
            }
        }
    },
    methods: {
        fireMessage: function(input){
            this.$emit('apply-filter', input);
             //designed to avoid going back to original state.
            this.sortStates[input].state = (this.sortStates[input].state + 1) % 2;
            if (this.numericFilters.has(input)) this.sortStates[input].img = this.sortNumImgs[this.sortStates[input].state];
            else this.sortStates[input].img = this.sortAlphaImgs[this.sortStates[input].state];
            this.$emit('apply-sort', {
                state: this.sortStates[input].state,
                from: input,
            });
        },
        aggregate: function(){
            this.$emit('apply-aggregate');
        }
    },
    computed: {
        nameImg: {
            get: function(){
                return this.sortStates['name'].img;
            }
        },
        quantityImg: {
            get: function(){
                return this.sortStates['quantity'].img;
            }
        },
        storeImg: {
            get: function(){
                return this.sortStates['store'].img;
            }
        },
        typeImg: {
            get: function(){
                return this.sortStates['type'].img;
            }
        },
        purchaseDateImg: {
            get: function(){
                return this.sortStates['purchaseDate'].img;
            }
        },
        expirationDateImg: {
            get: function(){
                return this.sortStates['expirationDate'].img;
            }
        },
        expiredImg: {
            get: function(){
                return this.sortStates['expired'].img;
            }
        }
    },
    watch: {
        clear: function(){
            if (this.clear){
                for (let filter of this.filters){
                    if (this.numericFilters.has(filter)){
                        this.sortStates = Object.assign({}, this.sortStates, {
                            [filter]: {
                                state: 2,
                                img: this.sortNumImgs[2],
                            }
                        })
                    } else {
                        this.sortStates = Object.assign({}, this.sortStates, {
                            [filter]: {
                                state: 2,
                                img: this.sortAlphaImgs[2],
                            }
                        })
                    }
                }
                this.$emit('wiped-states');
            }
        }
    },
    props: ['inputArray', 'clear'],
}

</script>

<template>

    <div class="tile">
        <table>
            <thead class="fixed-table-header">
                <tr>
                    <th>
                        <button
                        class="filter-button"
                        @click="fireMessage('name')"
                        >Name <font-awesome-icon
                            :icon="nameImg"
                            ></font-awesome-icon>
                        </button>
                    </th>
                    <th>
                        <button class="filter-button"
                        @click="fireMessage('quantity')"
                        style="margin-right: 3px;"
                        >Quantity <font-awesome-icon
                            :icon="quantityImg"
                            ></font-awesome-icon>
                        </button>
                        <button
                        class="filter-button"
                        @click="aggregate()"
                        >Aggregate <font-awesome-icon
                            icon="plus"
                            ></font-awesome-icon>
                        </button>
                    </th>
                    <th>
                        <button class="filter-button"
                            @click="fireMessage('store')"
                            >Store <font-awesome-icon
                                :icon="storeImg"
                                ></font-awesome-icon>
                        </button>
                    </th>
                    <th>
                        <button class="filter-button"
                            @click="fireMessage('type')"
                            >Type <font-awesome-icon
                                :icon="typeImg"
                                ></font-awesome-icon>
                        </button>
                    </th>
                    <th>
                        <button class="filter-button"
                            @click="fireMessage('purchaseDate')"
                            >Purchase Date <font-awesome-icon
                                :icon="purchaseDateImg"
                                ></font-awesome-icon>
                        </button>
                    </th>
                    <th>
                        <button class="filter-button"
                            @click="fireMessage('expirationDate')"
                            >Expiration Date <font-awesome-icon
                                :icon="expirationDateImg"
                                ></font-awesome-icon></button></th>
                    <th>
                        <button class="filter-button"
                            @click="fireMessage('expired')"
                            >Expired? <font-awesome-icon
                                :icon="expiredImg"
                                ></font-awesome-icon>
                        </button>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in inputArray" :key="index">
                    <td>{{item.name}}</td>
                    <td>{{item.quantity}}</td>
                    <td>{{item.store}}</td>
                    <td>{{item.type}}</td>
                    <td>{{item.purchaseDate}}</td>
                    <td>{{item.expirationDate}}</td>
                    <td><font-awesome-icon
                        :icon="item.expired=='-' ?
                            'slash' :
                            (item.expired ?
                                'skull' :
                                'thumbs-up'
                            )"
                        ></font-awesome-icon>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

</template>

<style scoped>

.fixed-table-header{
    position: sticky;
    top: 0;
    background-color: #90a4ae;
    display: block;
}

tbody, thead tr {
    display: table;
    width: 100%;
    table-layout: fixed;
}
</style>
