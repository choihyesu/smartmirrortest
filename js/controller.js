(function(angular) {
  'use strict';

  function MirrorCtrl(AnnyangService, GeolocationService, WeatherService, MapService, SubwayService, YoutubeService, HueService, $scope, $timeout, $sce) {
    var _this = this;
    var command = COMMANDS.ko;
    var DEFAULT_COMMAND_TEXT = command.default;
    $scope.listening = false;
    $scope.debug = false;
    $scope.complement = command.hi;
    $scope.focus = "default";
    $scope.user = {};
    $scope.interimResult = DEFAULT_COMMAND_TEXT;

    $scope.colors=["#6ed3cf", "#9068be", "#e1e8f0", "#e62739"];
    //Update the time
    var tick = function() {
      $scope.date = new Date();
      $timeout(tick, 1000 * 60);
    };

    // Reset the command text
    var restCommand = function(){
      $scope.interimResult = DEFAULT_COMMAND_TEXT;
    }

    _this.init = function() {
      $scope.map = MapService.generateMap("Seoul,Korea");
      _this.clearResults();
      tick();
      restCommand();

      var playing = false, sound;
      //Get our location and then get the weather for our location
      GeolocationService.getLocation().then(function(geoposition){
        console.log("Geoposition", geoposition);
        WeatherService.init(geoposition).then(function(){
          $scope.currentForcast = WeatherService.currentForcast();
          $scope.weeklyForcast = WeatherService.weeklyForcast();
          console.log("Current", $scope.currentForcast);
          console.log("Weekly", $scope.weeklyForcast);
          //refresh the weather every hour
          //this doesn't acutually updat the UI yet
          //$timeout(WeatherService.refreshWeather, 3600000);
        });
      })

      var defaultView = function() {
        console.debug("Ok, going to default view...");
        $scope.focus = "default";
      }

      // List commands
      AnnyangService.addCommand(command.whatcanisay, function() {
        console.debug("Here is a list of commands...");
        console.log(AnnyangService.commands);
        $scope.focus = "commands";

      });

      // Go back to default view
      AnnyangService.addCommand(command.home, defaultView);

      // Hide everything and "sleep"
      AnnyangService.addCommand(command.sleep, function() {
        console.debug("Ok, going to sleep...");
        $scope.focus = "sleep";
      });

      // Go back to default view
      AnnyangService.addCommand(command.wake, defaultView);

      AnnyangService.addCommand(command.debug, function() {
        console.debug("Boop Boop. Showing debug info...");
        $scope.debug = true;
      });

      // Change name
      AnnyangService.addCommand(command.name, function(name) {
        console.debug("Hi", name, "nice to meet you");
        $scope.user.name = name;
      });

      AnnyangService.addCommand(command.task, function(task) {
        console.debug("I'll remind you to", task);
      });

      AnnyangService.addCommand(command.reminder, function() {
        console.debug("Clearing reminders");
      });

      // Clear log of commands
      AnnyangService.addCommand(command.clear, function(task) {
        console.debug("Clearing results");
        _this.clearResults()
      });

      // Check the time
      AnnyangService.addCommand(command.time, function(task) {
        console.debug("It is", moment().format('h:mm:ss a'));
        _this.clearResults();
      });

      AnnyangService.addCommand(command.term, function(term) {
        console.debug("Showing", term);
      });

      // Fallback for all commands
      AnnyangService.addCommand('*allSpeech', function(allSpeech) {
        console.debug(allSpeech);
        _this.addResult(allSpeech);
      });

      var resetCommandTimeout;
      //Track when the Annyang is listening to us
      AnnyangService.start(function(listening){
        $scope.listening = listening;
      }, function(interimResult){
        $scope.interimResult = interimResult;
        $timeout.cancel(resetCommandTimeout);
      }, function(result){
        $scope.interimResult = result[0];
        resetCommandTimeout = $timeout(restCommand, 5000);
      });
    };

    _this.addResult = function(result) {
      _this.results.push({
        content: result,
        date: new Date()
      });
    };

    _this.clearResults = function() {
      _this.results = [];
    };

    _this.init();
  }

  angular.module('SmartMirror')
  .controller('MirrorCtrl', MirrorCtrl);

}(window.angular));
