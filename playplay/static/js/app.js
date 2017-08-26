Vue.component('play-modal', {
  props: ['title', 'accept', 'dismiss', 'size'],
  computed: {
    modalClass() {
      switch(this.size) {
        case 'small':
          return 'modal-sm';
        case 'large':
          return 'modal-lg';
        default:
          return '';
      }
    }
  },
  template: `
<div class="modal fade" tabindex="-1" role="dialog">
  <div class="modal-dialog" v-bind:class="modalClass" role="document">
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
    // List of known games.
    games: [],
    // List of most recent and upcoming matches.
    matches: [],
    // List of players in the Match Player Modal.
    players: [],
    // The selected game.
    selectedGame: 'none',
    // The match being edited.
    currentMatch: null,
    // Picked winner.
    pickedWinner: null,
    // Last URL data (used to debounce BGG fetch)
    urlData: null
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
      var match = {
        game_title: $('#txtMatchGameTitle').val(),
        game_url: $('#txtMatchGameUrl').val(),
        play_time_min: parseInt($('#txtMatchGameTime').val()),
        play_time_max: parseInt($('#txtMatchGameTimeMax').val()),
        start_time: moment(date_time.date()).utc().format(),
        players_min: parseInt($('#txtMatchMinPlayers').val()),
        players_max: parseInt($('#txtMatchMaxPlayers').val()),
      };
      $.post('/api/v1/matches', match, (data) => {
        this.updateData();
        $('#addMatchModal').modal('hide');
      });
    },
    deleteMatch() {
      this.getCurrentMatch(event);
      var match = this.currentMatch;
      var result = confirm('Do you want to delete this match of ' +
                          match.game_title + '?\n\nThis cannot be undone.');
      if (result) {
        $.ajax({
          url: '/api/v1/matches',
          data: { 'id': match.id },
          type: 'DELETE',
          success: () => {
            this.currentMatch = null;
            this.updateData();
          }
        });
      }
    },
    lookupUrl(event) {
      var url = $(event.target).val();
      var result = url.match(/https?:\/\/boardgamegeek.com\/([^/]+)\/([^/]+)(?:\/.*)/);
      if (result) {
        var type = result[1];
        var id = result[2];
        console.log(type, id);
        this.fetchBGGdata(type, id);
      }
    },
    fetchBGGdata(type, id) {
      var params = {
        type: type,
        id: id
      };
      // Debounce requests to BGG. Don't request unless the URL data is
      // different from what was already fetched.
      if (this.urlData && this.urlData.type == params.type &&
                          this.urlData.id == params.id) {
        console.log('BGG: Identical data');
        return false;
      }
      console.log('BGG: Fetching new data...')
      $.get('https://boardgamegeek.com/xmlapi2/thing', params, (xml) => {
        // console.log(xml);
        var $doc = $(xml);
        $('#txtMatchGameTitle').val($doc.find('name[type=primary]').attr('value'));
        $('#txtMatchGameTime').val($doc.find('minplaytime').attr('value'));
        $('#txtMatchGameTimeMax').val($doc.find('maxplaytime').attr('value'));
        $('#txtMatchMinPlayers').val($doc.find('minplayers').attr('value'));
        $('#txtMatchMaxPlayers').val($doc.find('maxplayers').attr('value'));
        this.urlData = params;
      });
      return true;
    },
    addPlayer: function() {
      var $input = $('#editMatchPlayersModal input');
      var player = $input.val();
      player = player.replace(/;/g, '');
      if (this.haveName(this.players, player)) {
        alert('Player names must be unique.');
        return false;
      }
      if (player.length > 0) {
        this.players.push(player);
        $input.val('');
        return true;
      }
      return false;
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
    },
    haveName(array, name) {
      var index = array.findIndex(
        item => name.toLowerCase() === item.toLowerCase());
      return index >= 0;
    },
    // https://stackoverflow.com/a/11582513/486990
    getURLParameter(name) {
      return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
    }
  },
  mounted: function() {
    // Configure the Date-Time Picker.
    $('#dateTimeMatch').datetimepicker({
      inline: true,
      sideBySide: true,
      format: 'DDDD YYYY HH:mm',
      minDate: Date.now(),
      locale: 'en-gb'
    });
    // Configure the Add Match modal dialog.
    $('#addMatchModal').on('show.bs.modal', (e) => {
      // Reset form data.
      this.urlData = null;
      this.selectedGame = 'none';
      // Force the date-time-picker to update.
      $('#dateTimeMatch').datetimepicker('date', moment());
      this.resetMatchModal();
    });
    // Fetch match and game data.
    this.updateData();
    // Set up periodic polling.
    var seconds = this.getURLParameter('interval') || 60;
    setInterval(() => {
      console.log('Updating data...');
      this.updateData();
    }, seconds * 1000);
  }
})
