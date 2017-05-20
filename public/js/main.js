/* global Vue, VueRouter, $ */
/* exported app */
let mainData = {
  loaded: false,
  trails: {},
  houses: {},
  artists: {
    'artist-test-id': {
      id: 'artist-test-id',
      name: 'Artist Test Name',
      artforms: {
        id: 'artform-test-id',
        name: 'Artform Test Name'
      }
    }
  },
  artforms: {
    'artform-test-id': {
      id: 'artform-test-id',
      name: 'Artform Test Name',
      artists: [
        'artist-test-id'
      ]
    }
  }
};

$.ajax({
  async: false,
  method: 'GET',
  url: '/data.json',
  success: function(data) {
    console.log('ajax done');
    mainData.loaded = true;
    mainData.houses = data.houses;
    mainData.trails = data.trails;
  }
});

Vue.component('cat-nav', {
  props: ['list', 'path'],
  template: '#template-cat-nav'
});

Vue.component('trails-nav', {
  data: function() {
    return {
      path: '/trails',
      list: this.$root.trails
    };
  },
  template: '#template-trails-nav',
  // watch: {
  //   '$route': 'updateData',
  //   '$root.loaded': 'updateData'
  // },
  // methods: {
  //   updateData() {
  //     this.list = this.$root.trails;
  //   }
  // }
});

Vue.component('artforms-nav', {
  data: function() {
    return {
      path: '/artforms',
      list: this.$root.artforms
    };
  },
  template: '#template-artforms-nav',
  // watch: {
  //   '$route': 'updateData',
  //   '$root.loaded': 'updateData'
  // },
  // methods: {
  //   updateData() {
  //     this.list = this.$root.artforms;
  //   }
  // }
});

Vue.component('list-houses', {
  props: ['list'],
  template: '#template-list-houses'
});

Vue.component('list-artists', {
  props: ['list'],
  template: '#template-list-artists'
});

const Index = {
  data: function() {
    return {

    };
  },
  template: '#template-section-index'
};

const Houses = {
  data: function() {
    return {
      list: this.$root.houses
    };
  },
  template: '#template-section-houses',
  // watch: {
  //   '$route': 'updateData',
  //   '$root.loaded': 'updateData'
  // },
  // methods: {
  //   updateData() {
  //     this.list = this.$root.houses;
  //   }
  // }
};

const HouseDetails = {
  data: function() {
    const id = this.$route.params.id;
    const item = this.$root.houses[id];
    const trailId = item.trail.id;
    const trail = this.$root.trails[trailId];
    const houseIndex = trail.houses.indexOf(id);
    const nextHouseId = trail.houses[houseIndex + 1];
    const prevHouseId = trail.houses[houseIndex - 1];
    let nextHouse = false;
    let prevHouse = false;

    if (nextHouseId) {
      nextHouse = this.$root.houses[nextHouseId];
    }

    if (prevHouseId) {
      prevHouse = this.$root.houses[prevHouseId];
    }

    return {
      item: this.$root.houses[id],
      prev: prevHouse,
      next: nextHouse
    };
  },
  template: '#template-section-house-details',
  // watch: {
  //   '$route': 'updateData',
  //   '$root.loaded': 'updateData'
  // },
  // methods: {
  //   updateData() {
  //     const id = this.$route.params.id;
  //     const item = this.$root.houses[id];
  //     const trailId = item.trail.id;
  //     const trail = this.$root.trails[trailId];
  //     const houseIndex = trail.houses.indexOf(id);
  //     const nextHouseId = trail.houses[houseIndex + 1];
  //     const prevHouseId = trail.houses[houseIndex - 1];
  //     let nextHouse = false;
  //     let prevHouse = false;

  //     if (nextHouseId) {
  //       nextHouse = this.$root.houses[nextHouseId];
  //     }

  //     if (prevHouseId) {
  //       prevHouse = this.$root.houses[prevHouseId];
  //     }

  //     this.item = item;
  //     this.next = nextHouse;
  //     this.prev = prevHouse;
  //   }
  // }
};

const TrailDetails = {
  data: function() {
    const id = this.$route.params.id;
    let list = [];
    const trail = this.$root.trails[id];

    if (trail) {
      trail.houses.forEach((item) => {
        if (item) {
          list.push(this.$root.houses[item]);
        }
      });
    }

    return {
      list: list
    };
  },
  template: '#template-section-trail-details',
  // watch: {
  //   '$route': 'updateData',
  //   '$root.loaded': 'updateData'
  // },
  // methods: {
  //   updateData() {
  //     const id = this.$route.params.id;
  //     let list = [];
  //     const trail = this.$root.trails[id];

  //     if (trail) {
  //       trail.houses.forEach((item) => {
  //         if (item) {
  //           list.push(this.$root.houses[item]);
  //         }
  //       });
  //     }

  //     this.list = list;
  //   }
  // }
};

const Artists = {
  data: function() {
    return {
      list: this.$root.artists
    };
  },
  template: '#template-section-artists',
  // watch: {
  //   '$route': 'updateData',
  //   '$root.loaded': 'updateData'
  // },
  // methods: {
  //   updateData() {
  //     this.list = this.$root.artists;
  //   }
  // }
};

const ArtistDetails = {
  data: function() {
    return {

    };
  },
  template: '#template-section-artist-details'
};

const ArtformDetails = {
  data: function() {
    const id = this.$route.params.id;
    let list = [];
    const artform = this.$root.artforms[id];

    if (artform) {
      artform.artists.forEach((item) => {
        if (item) {
          list.push(this.$root.artists[item]);
        }
      });
    }

    return {
      list: list
    };
  },
  template: '#template-section-artform-details',
  // watch: {
  //   '$route': 'updateData',
  //   '$root.loaded': 'updateData'
  // },
  // methods: {
  //   updateData() {
  //     const id = this.$route.params.id;
  //     let list = [];
  //     const artform = this.$root.artforms[id];

  //     if (artform) {
  //       artform.artists.forEach((item) => {
  //         if (item) {
  //           list.push(this.$root.artists[item]);
  //         }
  //       });
  //     }

  //     this.list = list;
  //   }
  // }
};

const Page404 = {
  data: function() {
    return {

    };
  },
  template: '#template-section-404'
};


const routes = [
  { path: '/',             component: Index                               },
  { path: '/houses',       component: Houses                              },
  { path: '/houses/:id',   component: HouseDetails                        },
  { path: '/trails',                                 redirect: '/houses'  },
  { path: '/trails/:id',   component: TrailDetails                        },
  { path: '/artists',      component: Artists                             },
  { path: '/artists/:id',  component: ArtistDetails                       },
  { path: '/artforms',                               redirect: '/artists' },
  { path: '/artforms/:id', component: ArtformDetails                      },
  { path: '/404',          component: Page404                             },
  { path: '*',                                       redirect: '/404'     }
];




const router = new VueRouter({
  mode: 'history',
  hashbang: false,
  routes: routes
});

const app = new Vue({
  el: '#app',
  router,
  data: function() {
    return mainData;
  }
});