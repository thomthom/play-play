Vue.component('play-modal', {
  props: ['title', 'accept', 'dismiss'],
  template: `
<div class="modal fade" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">{{ title }}</h4>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">
          {{ dismiss }}
        </button>
        <button type="button" class="btn btn-primary"
                v-on:click="$emit('accept')">
          {{ accept }}
        </button>
      </div>
    </div>
  </div>
</div>
`
})


var app = new Vue({
  el: '#app',
  data: {
    matches: []
  },
  methods: {
    getMatches: function() {
      $.get('/api/v1/matches', (data) => {
        this.matches = data;
      });
    },
    addMatch: function() {
      var date_time = $('#dateTimeMatch').data("DateTimePicker");
      var match = {
        game_title: 'Exploding Kittens',
        game_url : 'https://boardgamegeek.com/boardgame/172225/exploding-kittens',
        start_time: date_time.date().format(),
        players_min: 2,
        players_max: 5,
      };
      $.post('/api/v1/matches', match, (data) => {
        this.getMatches();
        $('#addMatchModal').modal('hide');
      });
    },
    addGame: function() {
      console.log('Add Game!');
    },
    // Hack: Quick and dirty!
    // https://laracasts.com/discuss/channels/vue/momentjs-with-vue/replies/283896
    moment(...args) {
      return moment(...args);
    }
  },
  mounted: function() {
    this.getMatches();
  }
})
