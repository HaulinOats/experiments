(function () {
  //Created in 2016. More courses and data may be
  //available from the Treehouse API
  //   
  //change to YOUR treehouse username
  //choose if you want to hide courses you haven't started yet
  var userName = "brettconnolly",
      hideEmptyCourses = false,
      showLanguageIcons = true;

  //Language Icons
  var languageIcons = {
    "HTML": {
      "class":"devicon-html5-plain",
      "color":"#F9845B"
    },
    "CSS":{
      "class":"devicon-css3-plain",
      "color":"#3079AB"
    },
    "Design":{
      "class":"devicon-photoshop-plain",
      "color":"#E79B00"
    },
    "JavaScript":{
      "class":"devicon-javascript-plain",
      "color":"#C25975"
    },
    "Ruby":{
      "class":"devicon-ruby-plain",
      "color":"#E15258"
    },
    "PHP":{
      "class":"devicon-php-plain",
      "color":"#7D669E"
    },
    "WordPress":{
      "class":"devicon-wordpress-plain",
      "color":"#838CC7"
    },
    "iOS":{
      "class":"devicon-apple-original colored",
      "color":"#53BBB4"
    },
    "Android":{
      "class":"devicon-android-plain",
      "color":"#51B46D"
    },
    "Development Tools":{
      "class":"devicon-gulp-plain",
      "color":"#637a91"
    },
    "Business":{
      "class":"devicon-bootstrap-plain",
      "color":"#5cb860"
    },
    "Python":{
      "class":"devicon-python-plain",
      "color":"#F092B0"
    },
    "Java":{
      "class":"devicon-java-plain",
      "color":"#2C9676"
    },
    "Digital Literacy":{
      "class":"devicon-chrome-plain",
      "color":"#c38cd4"
    },
    "Game Development":{
      "class":"devicon-cplusplus-plain",
      "color":"#20898c"
    }
  }
  
  //Link icon and Google fonts as stylesheet
  var devIcons = document.createElement("link");
  devIcons.rel = "stylesheet";
  devIcons.href = "https://cdn.rawgit.com/konpa/devicon/89f2f44ba07ea3fff7e561c2142813b278c2d6c6/devicon.min.css";
  document.head.appendChild(devIcons);

  // Polyfill support
  HTMLElement.prototype.createShadowRoot = 
  HTMLElement.prototype.createShadowRoot ||
  HTMLElement.prototype.webkitCreateShadowRoot ||
  function() {};

  //Imports Google Font 'Varela Round' which looks most similar
  //to the Treehouse font
  WebFontConfig = {
      google: { families: [ 'Varela+Round::latin' ] }
    };
    (function() {
      var wf = document.createElement('script');
      wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
      wf.type = 'text/javascript';
      wf.async = 'true';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(wf, s);
    })();

  // Add the template to the Shadow DOM
  var tmpl = document.querySelector('.treehouse-activity-template');
  var host = document.querySelector('.treehouse-activity');
  var root = host.attachShadow({mode:'open'});
  root.appendChild(document.importNode(tmpl.content, true));

  //get Treehouse API data
  var oReq = new XMLHttpRequest();
  oReq.onload = function (e) {
      var data = e.currentTarget.response,
          totalPoints = data.points.total,
          courseNamesArray = [],
          header = root.querySelector(".points").innerHTML = totalPoints,
          courseContainer = root.querySelector('.courses'),
          courseHtml = "";
    
      //sort courses by points
      for (var key in data.points)
        courseNamesArray.push([key, data.points[key]]);
      courseNamesArray.sort(function(a, b){return b[1] - a[1]});
   /*   courseNamesArray.reverse();*/
     /* console.log(courseNamesArray);*/
 
      for(var i = 1; i < courseNamesArray.length;i++){
        if (hideEmptyCourses && courseNamesArray[i][1] === 0 || languageIcons[courseNamesArray[i][0]] === undefined)
          continue;
        else {
          //build individual course content
          courseHtml += "<div class='single-course'><i class='course-icons " + languageIcons[courseNamesArray[i][0]].class + "' style='color:"+ languageIcons[courseNamesArray[i][0]].color +"'></i><b>"+ courseNamesArray[i][0] +"</b> : "+ courseNamesArray[i][1] +"</div>";
        }
      }
      courseContainer.innerHTML = courseHtml;
      
      //If not wanting language icons
      if (!showLanguageIcons) {
        var icons = root.querySelectorAll('.course-icons');
        for (var i = 0; i < icons.length; i++) {
          icons[i].className = "bullet-icons";
          icons[i].innerHTML = "&#8226;"
        }
      }
    
      //link to profile
      root.querySelector('.profile-link').setAttribute('href',"https://teamtreehouse.com/" + userName);
                                       
  };
  oReq.open('GET', "https://teamtreehouse.com/"+ userName +".json", true);
  oReq.responseType = 'json';
  oReq.send();
})();