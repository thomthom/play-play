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
    games: [],
    matches: [],
    // List of players in the Match Player Modal.
    players: [],
    // The match being edited.
    currentMatch: null,
    // Picked winner
    pickedWinner: null
  },
  computed: {
    canAddPlayer: function () {
      return !(this.currentMatch &&
               this.players.length < this.currentMatch.players_max);
    },
  },
  methods: {
    showMatchPlayerModal: function(event) {
      this.getCurrentMatch(event);
      $('#editMatchPlayersModal').modal('show');
    },
    getMatches: function() {
      $.get('/api/v1/matches', (data) => {
        this.matches = data;
      });
    },
    addMatch: function() {
      var date_time = $('#dateTimeMatch').data("DateTimePicker");
      // console.log(moment(date_time.date()).format());
      // console.log(moment(date_time.date()).utc().format());
      var match = {
        game_title: $('#txtMatchGameTitle').val(),
        game_url: $('#txtMatchGameUrl').val(),
        play_time_min: parseInt($('#txtMatchGameTime').val()),
        play_time_max: parseInt($('#txtMatchGameTimeMax').val()),
        start_time: moment(date_time.date()).utc().format(),
        players_min: parseInt($('#txtMatchMinPlayers').val()),
        players_max: parseInt($('#txtMatchMaxPlayers').val()),
      };
      // TODO(thomthom): Validate
      $.post('/api/v1/matches', match, (data) => {
        this.updateData();
        $('#addMatchModal').modal('hide');
      });
    },
    addPlayer: function() {
      var $input = $('#editMatchPlayersModal input');
      var player = $input.val();
      player = player.replace(/;/g, '');
      // TODO: Validate - no duplicate names.
      if (player.length > 0) {
        this.players.push(player);
        $input.val('');
      }
    },
    removePlayer: function(index) {
      this.players.splice(index, 1);
    },
    saveMatchPlayers: function() {
      var match = this.currentMatch;
      var data = {
        'id': match.id,
        'players_registered': this.players.sort().join(';')
      }
      $.ajax({
        url: '/api/v1/matches',
        data: data,
        type: 'PATCH',
        success: () => {
          $('#editMatchPlayersModal').modal('hide');
          this.currentMatch = null;
          this.updateData();
        }
      });
    },
    showMatchWinnerDialog: function (event) {
      this.getCurrentMatch(event);
      $('#editMatchWinnerModal').modal('show');
    },
    pickWinner: function(winner) {
      this.pickedWinner = winner;
    },
    saveMatchWinner: function() {
      var match = this.currentMatch;
      var data = {
        'id': match.id,
        'winner': this.pickedWinner
      }
      $.ajax({
        url: '/api/v1/matches',
        data: data,
        type: 'PATCH',
        success: () => {
          $('#editMatchWinnerModal').modal('hide');
          this.currentMatch = null;
          this.updateData();
        }
      });
    },
    canPickWinner(match) {
      return match.players_registered.length > 0 &&
        moment().isAfter(moment(match.start_time))
    },
    getCurrentMatch(event) {
      var index = $(event.target).closest('tr').data('match');
      var match = this.matches[index];
      this.currentMatch = match;
      var players = this.split(match.players_registered, ';');
      this.players = players;
      this.pickedWinner = match.winner
    },
    resetMatchModal: function() {
      $('#txtMatchGameTitle').val('');
      $('#txtMatchGameUrl').val('');
      $('#txtMatchGameTime').val('');
      $('#txtMatchGameTimeMax').val('');
      $('#txtMatchMinPlayers').val('');
      $('#txtMatchMaxPlayers').val('');
    },
    getGames: function () {
      $.get('/api/v1/games', (data) => {
        this.games = data;
      });
    },
    selectGame: function(event) {
      var index = $(event.target).val();
      var game = this.games[index];
      $('#txtMatchGameTitle').val(game.game_title);
      $('#txtMatchGameUrl').val(game.game_url);
      $('#txtMatchGameTime').val(game.play_time_min);
      $('#txtMatchGameTimeMax').val(game.play_time_max);
      $('#txtMatchMinPlayers').val(game.players_min);
      $('#txtMatchMaxPlayers').val(game.players_max);
    },
    updateData: function() {
      this.getMatches();
      this.getGames();
    },
    // Hack: Quick and dirty!
    // https://laracasts.com/discuss/channels/vue/momentjs-with-vue/replies/283896
    moment(...args) {
      return moment(...args);
    },
    split(string, delimiter) {
      return string.split(delimiter).filter(x => x);
    }
  },
  mounted: function() {
    $('#dateTimeMatch').datetimepicker({
      inline: true,
      sideBySide: true,
      format: 'DDDD YYYY HH:mm',
      minDate: Date.now(),
      locale: 'en-gb'
    });
    $('#addMatchModal').on('show.bs.modal', (e) => {
      // Force the date-time-picker to update.
      $('#dateTimeMatch').datetimepicker('date', moment());
      this.resetMatchModal();
    })
    this.updateData();
  }
})
