angular
  .module("starter.controllers", ["ngStorage"])

  // --- Standard Ceres Promies ---
  .service("CeresPromise", function($http, $q) {
    var deferred = $q.defer();
    // --- GET
    this.DoStandGet = function(ServiceName) {
      return $http.get(ServiceName).then(
        function(data, status, headers, config) {
          // --- promise is fulfilled
          return $q.when(data);
        },
        function(response) {
          // --- promise is rejected
          deferred.reject(response);
          alert("ERROR: " + JSON.stringify(response, null, 4));
          return;
        }
      );
    };
    // --- POST
    this.DoStandPost = function(ServiceName, Data) {
      return $http.post(ServiceName, Data).then(
        function(data, status, headers, config) {
          // --- promise is fulfilled
          return $q.when(data);
        },
        function(response) {
          // --- promise is rejected
          deferred.reject(data);
          alert("ERROR: " + JSON.stringify(data, null, 4));
          return;
        }
      );
    };
  }) // END CeresPromise

  .controller("AppCtrl", function(
    $scope,
    $ionicModal,
    $timeout,
    $http,
    $window,
    CeresPromise
  ) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal
      .fromTemplateUrl("templates/login.html", {
        scope: $scope
      })
      .then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
      $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
      if ($scope.loginData.username != "Roger") {
        return;
      }

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function() {
        $scope.closeLogin();
      }, 1000);
    };
  })

  .controller("PlaylistsCtrl", function($scope, $window, CeresPromise) {
    // --- Check if this route has been created and is to be updated.
    var StoreScheds = [];
    var NewSet = [];
    var ObjScheds = [];
    var StoredScheds = [];

    StoredScheds = $window.localStorage.getItem("StoredScheds");
    if (StoredScheds == null) {
      NewSet = {
        SchedKey: FullKey
      };
      ObjScheds.push(NewSet);
      $window.localStorage.setItem("StoredScheds", JSON.stringify(ObjScheds));
    } else {
      NewSet = {
        SchedKey: FullKey
      };
      ObjScheds = JSON.parse(StoredScheds);
      var LenAr = ObjScheds.length;
      var FoundI = false;
      for (var i = 0; i < LenAr; i++) {
        TableSched = JSON.stringify(ObjScheds[i].SchedKey);
        var FindIt = TableSched.indexOf(FullKey);
        if (FindIt > 0) {
          FoundI = true;
          break;
        }
      }
      if (FoundI == false) {
        ObjScheds.push(NewSet);
        $window.localStorage.setItem("StoredScheds", JSON.stringify(ObjScheds));
      }
    }
    // --- Initialise the array with the details stored so far
    $scope.comm2 = [];
    $scope.comm2 = $window.localStorage.getItem($scope.FullKey);

    // --- Check if position is on
    if ("geolocation" in navigator) {
    } else {
      alert(
        "GeLocation is NOT available. \nEnsure location on and reselect URL"
      );
      return;
    }

    // --- FIRST TIME THRU: Get the full delivery schedule from Larportal
    var FullKey = "Roger";

    var ServiceName =
      "https://larportal.argility.com/cgi-bin/MultiTrax/GetMultiDelSched.cgi?~WS=DriverSched~Key=303001365Roger12";
    CeresPromise.DoStandGet(ServiceName).then(
      function(data) {
        $scope.CountRoute = data.data.length - 1;
        $scope.FullSched = data;

        $scope.DocNo = $scope.FullSched.data[0].DocNo;
        $scope.DriverName = $scope.FullSched.data[0].Drvr;
        $scope.DriverCell = $scope.FullSched.data[0].DrCl;
        $scope.DelRoute = $scope.FullSched.data[0].SchedNo;
        $scope.Acc = $scope.FullSched.data[0].Acc;
        $scope.CName = $scope.FullSched.data[0].CName;
        $scope.Add1 = $scope.FullSched.data[0].Add1;
        $scope.Add2 = $scope.FullSched.data[0].Add2;
        $scope.Add3 = $scope.FullSched.data[0].Add3;
        $scope.Add4 = $scope.FullSched.data[0].Add4;
        $scope.Pcd = $scope.FullSched.data[0].Pcd;
        $scope.Ins1 = $scope.FullSched.data[0].Ins1;
        $scope.Ins2 = $scope.FullSched.data[0].Ins2;
        $scope.Ins3 = $scope.FullSched.data[0].Ins3;
        $scope.Ins4 = $scope.FullSched.data[0].Ins4;
        $scope.Item = $scope.FullSched.data[0].Itm;
        $scope.Des = $scope.FullSched.data[0].Des;

        $scope.CountRoute = data.data.length - 1;
        var LastDel = data.data.length - 1;
        $scope.FullSched = data;
        $scope.ShowLine1 = 1;
      },
      function(error) {
        alert(
          "ERROR: Cannot get Delivery Schedule from Db: " +
            JSON.stringify(error)
        );
      }
    );

    // --------------- SHOW NEXT/PREVIOUS DELIVERY NOTE ----------------
    $scope.NextDelNote = function(Direction) {
      $scope.ShowNext = 0;
      $scope.ShowPrevious = 0;
      alert("Direction: " + Direction);
      if (Direction == "next") {
        $scope.DocCount = $scope.DocCount + 1;
        if (parseInt($scope.DocCount) >= parseInt($scope.CountRoute)) {
          $scope.DocCount = $scope.CountRoute;
          $scope.ShowNext = 1;
        }
        alert("This is it: " + $scope.FullSched.data[1].Add1);

        var ThisDoc = $scope.ObjSchedsCol[$scope.DocCount].DelNo;
        var ThisCol = $scope.ObjSchedsCol[$scope.DocCount].Colour;
        $scope.HeaderStyle = { color: ThisCol };
      } else {
        $scope.DocCount = $scope.DocCount - 1;
        if ($scope.DocCount < 1) {
          $scope.DocCount = 0;
          $scope.ShowPrevious = 1;
        }
        var ThisDoc = $scope.ObjSchedsCol[$scope.DocCount].DelNo;
        var ThisCol = $scope.ObjSchedsCol[$scope.DocCount].Colour;
        $scope.HeaderStyle = { color: ThisCol };
      }
      var sub = $scope.DocCount;
      $scope.DriverName = $scope.FullSched.data[sub].Drvr;
      $scope.DocNo = $scope.FullSched.data[sub].DocNo;
      $scope.DriverCell = $scope.FullSched.data[sub].DrCl;
      $scope.DelRoute = $scope.FullSched.data[sub].SchedNo;
      $scope.Acc = $scope.FullSched.data[sub].Acc;
      $scope.CName = $scope.FullSched.data[sub].CName;
      $scope.Add1 = $scope.FullSched.data[sub].Add1;
      $scope.Add2 = $scope.FullSched.data[sub].Add2;
      $scope.Add3 = $scope.FullSched.data[sub].Add3;
      $scope.Add4 = $scope.FullSched.data[sub].Add4;
      $scope.Pcd = $scope.FullSched.data[sub].Pcd;
      $scope.Ins1 = $scope.FullSched.data[sub].Ins1;
      $scope.Ins2 = $scope.FullSched.data[sub].Ins2;
      $scope.Ins3 = $scope.FullSched.data[sub].Ins3;
      $scope.Ins4 = $scope.FullSched.data[sub].Ins4;
      $scope.Item = $scope.FullSched.data[sub].Itm;
      $scope.Des = $scope.FullSched.data[sub].Des;
    };

    function geo_success(position) {
      $scope.FullGPS =
        position.coords.latitude + "," + position.coords.longitude;
      $scope.ThisLat = position.coords.latitude;
      $scope.ThisLng = position.coords.longitude;
      $scope.Heading = position.coords.heading;
      $scope.time = position.timestamp;
      if (position.coords.accuracy != null) {
        $scope.accuracy = position.coords.accuracy.toFixed(2);
      }
      if (position.coords.altitude != null) {
        $scope.altitude = position.coords.altitude.toFixed(2);
      }
      $scope.GotCords = 1;

      // --- Convert speed from m/s to kph
      var speed = position.coords.speed * 3.6;
      $scope.speed = speed.toFixed(2);

        alert("FullGPS: " + $scope.FullGPS);

      // --- Now write the marked positions to local storage 
      NewObj = {
        Tracks: $scope.DriverName,
        Route: $scope.DelRoute,
        Track_GPS: $scope.FullGPS,
        Lat: $scope.ThisLat,
        Long: $scope.ThisLng,
        Heading: $scope.Heading,
        GPSTime: $scope.time,
        Accuracy: $scope.accuracy,
        Altitud: $scope.altitude,
        Speed: $scope.speed
      };
    }

    function geo_error() {
      alert("Sorry, no position available.");
    }

    var geo_options = {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 27000
    };

    var wpid = navigator.geolocation.watchPosition(
      geo_success,
      geo_error,
      geo_options
    );

    $scope.playlists = [
      { title: "Reggae", id: 1 },
      { title: "Chill", id: 2 },
      { title: "Dubstep", id: 3 },
      { title: "Indie", id: 4 },
      { title: "Rap", id: 5 },
      { title: "Cowbell", id: 6 }
    ];
  })

  .controller("PlaylistCtrl", function($scope, $stateParams) {
    alert("In the playlist");
  });
