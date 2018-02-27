//Here I put all location
  var MyLocation = {
    currentPlace: ko.observable(null),
    markers: [
    {
        title: 'Kabah',
        lat: 21.422487,
        lng:  39.826206,
        highlight: ko.observable(false)
    },
    {
        title: 'AlNor Hospital',
        lat: 21.385031451289365,
        lng: 39.860544204711914,
        highlight: ko.observable(false)
    },
    {
        title: 'Ad Diyafah',
        lat: 21.43584459802708,
        lng: 39.8001709068194,
        highlight: ko.observable(false)
    },
    {
        title: 'Albaik',
        lat: 21.421111484957944,
        lng: 39.82166290283203,
        highlight: ko.observable(false)
    },
    {
        title: 'Ghar Thowr',
        lat: 21.37723891309099,
        lng: 39.84972953796387,
        highlight: ko.observable(false)
    },
    {
        title: 'Ghar Hira',
        lat: 21.4575864,
        lng: 39.859275600000046,
        highlight: ko.observable(false)
    },
    {
        title: 'Jarir',
        lat: 21.44484033655246,
        lng: 39.86045837402344,
        highlight: ko.observable(false)
    },
    {
        title: 'Abraj Albait',
        lat: 21.4187514,
        lng: 39.82555639999998,
        highlight: ko.observable(false)
    }
]
};


var ViewModel = function() {
  var self = this;
  var map, geocoder, bounds, mywindow;
  self.wikiLinks = ko.observableArray([]);
  self.markerArray = ko.observableArray();
  self.query = ko.observable('');
  //initialization my map by using map markers from MyLocation data.
  var initMap = function() {
    // Check if Google Maps object exists. If it does, create map. If not, display error
    if(typeof window.google === 'object' && typeof window.google.maps === 'object') {
      var mapOptions = {
        disableDefaultUI: true
      };
      //Here it will start to creat map of my places
      map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
      geocoder = new google.maps.Geocoder();
      bounds = new google.maps.LatLngBounds();
      mywindow = new google.maps.InfoWindow({
        content: null
      });
      //Here it will start creat a marker of my places
      var markerList = MyLocation.markers;
      for(var x = 0; x < markerList.length; x++) {
        var markPostion = new google.maps.LatLng(
          markerList[x].lat,
          markerList[x].lng
        );

        var marker = new google.maps.Marker({
          position: markPostion,
          map: map,
          title: markerList[x].title,
          highlight: markerList[x].highlight,
          animation: google.maps.Animation.DROP
        });

        function toggleBounce() {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}
        //Add click event listener to create infowindow for each marker object
        //Use Google geocoder to pull physical address from lat/lng position data
marker.addListener('click', toggleBounce);
        google.maps.event.addListener(marker, 'click', function() {
          var that = this;
          geocoder.geocode({'latLng': that.position}, function(results, status) {
            if(status == google.maps.GeocoderStatus.OK) {
              if(results[0]){
                var address = results[0].formatted_address;
                mywindow.setContent("<span class='title'>" + that.title);

              }
            }
          });
          mywindow.open(map, that);
          clearMarkers();
          //Modify marker show list to select
          that.highlight(true);

          //Move map viewport to the selected item
          //map.panTo(that.position);
          //MyLocation.currentMarker(that);
        });

        // Modify map viewport to include new map marker
        bounds.extend(markPostion);

        //Add marker to array
        self.markerArray.push(marker);
      }
      //Resize map to fit all markers
      map.fitBounds(bounds);
      map.setCenter(bounds.getCenter());

      //Check window size
      checkWindowSize();
    } else {
      //if no google object found, display error
      self.mapUnavailable(true);
    }
  }();

//******************************************************************************************

    /*Knockout computed observable will filter and return items that match,
    And list of locations will be show.*/
  self.filteredArray = ko.computed(function() {
    return ko.utils.arrayFilter(self.markerArray(), function(marker) {
      return marker.title.toLowerCase().indexOf(self.query().toLowerCase()) !== -1;
    });
  }, self);
  self.filteredArray.subscribe(function() {
      var diffArray = ko.utils.compareArrays(self.markerArray(), self.filteredArray());
      ko.utils.arrayForEach(diffArray, function(marker) {
        if (marker.status === 'deleted') {
          marker.value.setMap(null);
        } else {
          marker.value.setMap(map);
        }
      });
    });

  //Highlight map marker if list item is clicked.
  self.selectItem = function(listItem) {
    google.maps.event.trigger(listItem, 'click');
  };

  //Toggle showing marker list
  self.toggleList = function() {
    self.showList(!self.showList());
  };

  // Helper function to check viewport width, called only on initialization of map.
  function checkWindowSize() {
    if($(window).width() < 400){
      self.showList(false);
    }
  }

  self.loadData = function(location) {
        console.log(self.wikiLinks.length);

        // clear out old data before new request
        self.wikiLinks([]);

        var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + MyLocation.title +
            '&format=json&callback=wikiCallback';

        // if the wikipedia links fail to load after 8 seconds the user will get the message 'failed to get wikipedia resources'.
        var wikiRequestTimeout = setTimeout(function() {
            self.wikiLinks.push("failed to get wikipedia resources");
        }, 8000);

        $.ajax({
            url: wikiUrl,
            dataType: "jsonp",
            success: function(response) {
                self.wikiLinks([]);
                var articleList = response[1];
                for (var i = 0; i < articleList.length; i++) {
                    articleStr = articleList[i];
                    var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                    self.wikiLinks.push('<a href="' + url + '">' + articleStr + '</a>');
                }
                clearTimeout(wikiRequestTimeout);
            }
        });
        return false;
    };
};


ko.applyBindings(new ViewModel());
