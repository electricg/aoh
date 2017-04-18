/* global Vue, VueRouter, $ */
/* exported app */
let mainData = {
  loaded: false,
  message: 'first',
  nav: [
    { id: 'index',    path: '/index',    name: 'Home',      component: 'Index'    },
    { id: 'houses',   path: '/houses',   name: 'Houses',    component: 'Houses'   },
    { id: 'trails',   path: '/trails',   name: 'Trails',    component: 'Trails'   },
    { id: 'artists',  path: '/artists',  name: 'Artists',   component: 'Artists'  },
    { id: 'artforms', path: '/artforms', name: 'Art Forms', component: 'Artforms' },
  ],
  trails: {},
  houses: {},
  artists: {
    'artist-test-id': {
      id: 'artist-test-id',
      name: 'Artist Test Name'
    }
  },
  artforms: {
    'artform-test-id': {
      id: 'artform-test-id',
      name: 'Artform Test Name'
    }
  }
};

$.ajax({
  // async: false,
  method: 'GET',
  url: '/data.json',
  success: function(data) {
    console.log('ajax done');
    mainData.loaded = true;
    mainData.message = 'loaded';
    mainData.houses = data.houses;
    mainData.trails = data.trails;
  }
});

// Vue.component('todo-item', {
//   props: ['item'],
//   template: '<li>{{ item.name }}</li>'
// });

Vue.component('main-nav', {
  props: ['list'],
  template: '#template-main-nav'
});

Vue.component('cat-nav', {
  props: ['list', 'path'],
  template: '#template-cat-nav'
});

Vue.component('home-page', {
  template: '#template-home-page'
});

let mainComponents = {};

mainComponents.Details = Vue.component('giulia', {
  data: function() {
    const list = this.$parent.list;
    const id = this.$route.params.id;
    const item = list[id];

    return {
      item: item
    };
  },
  template: '#template-details',
  watch: {
    '$route': 'updateData',
    '$root.loaded': 'updateData'
  },
  methods: {
    updateData() {
      const list = this.$parent.list;
      const id = this.$route.params.id;
      const item = list[id];

      this.item = item;
    }
  }
});

mainComponents.TrailsDetails = {
  data: function() {
    const list = this.$parent.list;
    const id = this.$route.params.id;
    let item = list[id];
    if (item) {
      item.children = [];
      item.houses.forEach((houseId) => {
        if (houseId) {
          const house = this.$root.houses[houseId];
          item.children.push({
            id: house.id,
            name: house.name,
            number: house.trailNumber
          });
        }
      });
    }

    return {
      item: item
    };
  },
  template: '#template-trails-details',
  watch: {
    '$route': 'updateData',
    '$root.loaded': 'updateData'
  },
  methods: {
    updateData() {
      const list = this.$parent.list;
      const id = this.$route.params.id;
      let item = list[id];
      if (item) {
        item.children = [];
        item.houses.forEach((houseId) => {
          if (houseId) {
            const house = this.$root.houses[houseId];
            item.children.push({
              id: house.id,
              name: house.name,
              number: house.trailNumber
            });
          }
        });
      }

      this.item = item;
    }
  }
};

mainData.nav.forEach((item) => {
  mainComponents[item.component] = {
    data: function() {
      const path = item.path;
      const section = item.id;
      const list = this.$root[item.id];

      return {
        path: path,
        section: section,
        list: list
      };
    },
    template: '#template-section',
    watch: {
      '$route': 'updateData',
      '$root.loaded': 'updateData'
    },
    methods: {
      updateData() {
        this.list = this.$root[item.id];
      }
    }
  };
});

let routes = mainData.nav.map((item) => {
  let subComponent = 'Details';

  if (item.component === 'Trails') {
    subComponent = 'TrailsDetails';
  }

  return {
    path: item.path,
    component: mainComponents[item.component],
    children: [
      {
        path: ':id',
        component: mainComponents[subComponent]
      }
    ]
  };
});
routes.push({ path: '*', redirect: '/index' });




const router = new VueRouter({
  mode: 'history',
  hashbang: false,
  routes: routes
});

const app = new Vue({
  el: '#app',
  router,
  data: function() {
    console.log('data');
    return mainData;
  },
  // computed: {
  //   houses: function() {
  //     console.log('computed houses');
  //   }
  // },
  // watch: {
  //   trails: function() {
  //     console.log('watch trails', this.trails);
  //     this.message = 'xxx';
  //   }
  // },
  // created: function() {
  //   console.log('created');
  // }
});