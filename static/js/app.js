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
          {{ accept }}
        </button>
        <button type="button" class="btn btn-primary">
          {{ dismiss }}
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
      $.ajax({
        url: '/api/v1/matches'
        }).done(data => {
          this.matches = data;
        });
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
