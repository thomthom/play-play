Vue.component('play-modal', {
  props: ['title', 'accept', 'dismiss'],
  template: `
<div class="modal fade" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg" role="document">
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
        game_title: $('#txtMatchGameTitle').val(),
        game_url: $('#txtMatchGameUrl').val(),
        game_time: parseInt($('#txtMatchGameTime').val()),
        start_time: date_time.date().format(),
        players_min: parseInt($('#txtMatchMinPlayers').val()),
        players_max: parseInt($('#txtMatchMaxPlayers').val()),
      };
      $.post('/api/v1/matches', match, (data) => {
        this.getMatches();
        $('#addMatchModal').modal('hide');
      });
    },
    resetMatchModal: function() {
      $('#txtMatchGameTitle').val('');
      $('#txtMatchGameUrl').val('');
      $('#txtMatchGameTime').val('');
      $('#txtMatchMinPlayers').val('');
      $('#txtMatchMaxPlayers').val('');
    },
    // Hack: Quick and dirty!
    // https://laracasts.com/discuss/channels/vue/momentjs-with-vue/replies/283896
    moment(...args) {
      return moment(...args);
    }
  },
  mounted: function() {
    $('#dateTimeMatch').datetimepicker({
      inline: true,
      sideBySide: true,
      format: 'DDDD YYYY HH:mm',
      minDate: Date.now(),
    });
    $('#addMatchModal').on('show.bs.modal', (e) => {
      this.resetMatchModal();
    })
    this.getMatches();
  }
})
