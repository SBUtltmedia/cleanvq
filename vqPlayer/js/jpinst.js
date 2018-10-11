//Change Bubbles Text
//animateAnswerCorrect
//answerIncorrect
//
//PlayPauseButton
//playVideo()
//pauseVideo()
//
//PHP Calls
//getUserData
//cconce
//folderGrade
//saveData

//addVideoSource <----- altered
//showPerformance() in seekTimeUpdate()<-disabled
//seekTimeUpdate <----- disbaled

var questions;
var times = [];
var lastTime = 0;
var checkCounter = 0;
var pause = [];
var countSet = 10;
var currentQuestion = -1;
var video;
var scrubbing = false;
var showingQuestion = false;
var answerData = [];
var disableClicks = false;
var letterPanels = [];
var letterFlipInterval = -1;
var quizComplete = false;
var questionToggleEnabled = false;
var showingQuestions = true;
var lastSaved = 0;
var recordedCompletion = false;
var permissionData = {};
var canView = false;
var userScore = 0;

try {
  var urlVars = getUrlVars();
  var progress = new Progress(urlVars["local"]);
} catch (e) {
  // console.log(e);
}

// Watch data
var watchStart = 0;

// User data
var userData = {
  "watchData": [],
  "attempts": [],
  "answerData": [],
  "bestScore": 0,
  "dataVersion": 1
};

$(document).ready(function() {
  getPermissions();
  resizeWindow();
  $("#fullScreenButton").click(function() {
    setTimeout(function() {
      resizeWindow();
    }, 800);
  });
});

function getparams() {
  var url = new URL(window.location.href);
  var quizidauthor = url.pathname.replace(/\/$/, '').split('/').reverse();
  quizidauthor[0] = quizInfo.quizid
  quizidauthor[1] = quizInfo.author
  quizidauthor[2] = quizInfo.folder
  return quizidauthor;
}

function getPermissions() { // Called by 1 function: onload()
  var [quizid, author] = getparams();
  $.ajax({
    dataType: "json",
    url: "../"+author+"/"+quizid+"/json/permissions.json",
    data: "",
    success: function(data) {
			if(data.isPublic == undefined){
				console.log("Private")
			}else{
				console.log("Public")
			}

      permissionData = data;
      if (permissionData.isPublic || 1) {
        // Quiz is public
        $("#userInfoButton").css("display", "none");
        $("#quiz").css("visibility", "visible");
        $("#blocker").css("visibility", "hidden");
        canView = true;
        loadButtons();
      } else {
        // Quiz is not public
        $("#userInfoButton").css("display", "auto");
        getUserData();
      }
    },
    error: function() {
      permissionData = {
        "isPublic": false
      }
      // Quiz is not public
      $("#userInfoButton").css("display", "auto");
      getUserData();
    }
  });
}

function getUserData() { // Called by 1 function: getPermissions()
  var [quizid, author] = getparams();
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "../vqLib/api/loadUserData",
    data: {'vqBase':author+"/"+quizid+"/"},
    success: function(data) {
      if (Object.keys(data).length > 0) {
        userData = data;
      }
      if (userData.watchData == null) {
        userData.watchData = [];
      }
      if (userData.attempts == null) {
        userData.attempts = [];
      }
      if (userData.answerData == null) {
        userData.answerData = [];
      }
      if (userData.responses == null) {
        userData.responses = {};
      }
      if (userData.dataVersion != 1) {
        userData.dataVersion = 1;
      }
      loadUserData();
      loadButtons();
      updateScore();
    },
    error: function(e) {
			var url = window.location.href;
			var base = url.split("/");
			var whichVQ = base[3];
			//Exit out
    }
  });
}

function loadUserData() { // Called by 2 functions: getUserData() & completeQuiz()
  canView = false;
  if (permissionData.isPrivate != true) {
    canView = true;
  } else {
    for (var i = 0; i < permissionData.canAccessData.length; i++) {
      if (permissionData.canAccessData[i] == userData.netID) {
        canView = true;
      }
    }
    for (var i = 0; i < permissionData.canViewQuiz.length; i++) {
      if (permissionData.canViewQuiz[i] == userData.netID) {
        canView = true;
      }
    }
    if (window.location.href.indexOf(userData.netID) != -1) {
      canView = true;
    }
  }
  if (canView) {
    // Allowed to view video quiz
    $("#quiz").css("visibility", "visible");
    $("#blocker").css("visibility", "hidden");
    $("#userInfoLogin").text("Signed in as " + userData.nickname + " " + userData.lastname + " (" + userData.netID + ").");
    if (userData.attempts.length > 0) {
      $("#userInfoComplete").text("You have already completed this quiz.");
      quizComplete = true;
      $("#userInfoButton").addClass("anim_hexSpin");
      questionToggleEnabled = true;
    } else if (quizComplete) {
      $("#userInfoComplete").text("You have just completed this quiz.");
      $("#userInfoButton").addClass("anim_hexSpin");
      questionToggleEnabled = false;
    } else {
      $("#userInfoComplete").text("You have not completed this quiz yet.");
      questionToggleEnabled = false;
    }
    // Disabled question hiding (there is currently no point to it).
    if (questionToggleEnabled && false) {
      $("#toggleQuestionButton").css("visibility", "visible");
    } else {
      $("#toggleQuestionButton").css("visibility", "hidden");
    }
    // lol
    if (userData.netID == "japalmeri") {
      $("#playbackSpeed").append('<option value="5">5x</option>');
    }
  } else {
    // Not allowed to view video quiz
    $("#quiz").css("visibility", "hidden");
    $("#blocker").css("visibility", "visible");
  }
  updateScore();
}

function loadButtons() { // Called by 2 functions: getPermissions() & getUserData()

  var [quizid, author, folder, lti] = getparams();
  $.ajax({
    dataType: "json",
    url: "../"+author+"/"+quizid+"/json/quiz.json",
    data: {
      author,
      quizid
    }}).done(function(data){loadSuccess(data)}).fail(function(){console.log("Failed")})




function loadSuccess( data) {
  questions = data;
  console.log("Not Failed")
  if (userData.answerData.length < questions.questions.length || userData.answerData.length > questions.questions.length) {
    updateUser();

    function updateUser() {
      userData.answerData = [];
      for (var i = 0; i < questions.questions.length; i++) {
        var qr = {
          "answers": [],
          "correct": false,
          "score": 0
        };
        userData.answerData.push(qr);
      }
    }

  }
  prepQuestionScreen();
  $(window).keydown(function(e) {
    // Enter key pressed
    if (e.which == 13) {
      if ($("#fillInAnswer").val().length != 0) {
        submitTextAnswer($("#fillInAnswer").val());
      }
    }
  });

  // Video controls
  video = $("#videoBox")[0];
  addVideoSource();
  video.addEventListener("loadedmetadata", cconce);

  if (video.readyState >= 2) {
    cconce();
  }

  $('#cc')[0].addEventListener('click', togglecc);

  $('#bigPlay').click(playPause);
  $('#quizBank').hide();
  $("#videoPlayPause").click(function() {
    playPause();
  });

  $("#seekSlider").change(function() {
    vidSeek();
  });

  $("#seekSlider").on("mousedown touchstart", function(evt) {
    scrubbing = true;
  });

  $("#muteButton").click(function() {
    videoMute();
  });

  $("#volumeSlider").change(function() {
    setVolume();
  });

  $("body").on("mouseup touchend", function() {
    if (scrubbing) {
      scrubbing = false;
    }
  });

  setInterval(function() {
    if (!scrubbing) {
      seekTimeUpdate();
    }
  }, 30);

  if (questions.questions.length > 0) {
    // There are questions
    makeQuestionButtons();
    $("#noQuestionText").css("opacity", 0);
  } else {
    // No questions
    $("#noQuestionText").css("opacity", 1);
  }

  // Initialize wrong answer recording
  if (questions.questions.length > 0 && userData.answerData.length == 0) {
    for (var i = 0; i < questions.questions.length; i++) {
      var qr = {
        "answers": [],
        "correct": false,
        "score": 0
      };
      userData.answerData.push(qr);
    }
  }

  for (var i = 0; i < userData.answerData.length; i++) {
    if (userData.answerData[i].correct) {
      animateAnswerCorrect(i);
    }
  }

  if (checkFinished()) {
    setTimeout(function() {
      completeQuiz();
    }, 1000);
  }

  // Check if metadata has loaded
  if (video.readyState == 1) {
    setTimeout(metadataLoaded, 20);
    metadataLoaded();
  } else {
    video.addEventListener('loadedmetadata', function() {
      metadataLoaded();
    });
  }

  // Check if video has loaded
  if (canView) {
    if (video.readyState == 4) {
      metadataLoaded();
    } else {
      video.addEventListener('loadeddata', function() {
        playPause();
      });
    }
  }

  video.onended = function() {
    videoEnded();
  };

  $("#playbackSpeed").change(function() {
    video.playbackRate = $("#playbackSpeed").val();
  });

  $("title").text(questions.title);

  if (folder == null) {
    $("#quizTitle").text(questions.title);
  } else {
    $("#quizTitle").html(`<a href='../vqFolder?author=${author}&folder=${folder}&lti=${encodeURIComponent(lti)}'>${folder}</a> > ` + questions.title);
  }

  $("#userInfoButton").hover(function() {
    $("#userInfoBox").removeClass("anim_quickFadeOut");
    $("#userInfoBox").addClass("anim_quickFadeIn");
  }, function() {
    $("#userInfoBox").removeClass("anim_quickFadeIn");
    $("#userInfoBox").addClass("anim_quickFadeOut");
  });

  $("#toggleQuestionButton").click(function() {
    if (questionToggleEnabled) {
      if (showingQuestions) {
        hideQuestions();
      } else {
        showQuestions();
      }
    }
  });

  $("#toggleQuestionButton").hover(function() {
    $("#toggleQuestionBox").removeClass("anim_quickFadeOut");
    $("#toggleQuestionBox").addClass("anim_quickFadeIn");
  }, function() {
    $("#toggleQuestionBox").removeClass("anim_quickFadeIn");
    $("#toggleQuestionBox").addClass("anim_quickFadeOut");
  });

  $("#resetQuestionButton").click(function() {

    if (confirm("This will reset your quiz score and allow you to take it again, continue?")) {
      resetQuestions();
    }
  });

  $("#resetQuestionButton").hover(function() {
    $("#resetQuestionBox").removeClass("anim_quickFadeOut");
    $("#resetQuestionBox").addClass("anim_quickFadeIn");
  }, function() {
    $("#resetQuestionBox").removeClass("anim_quickFadeIn");
    $("#resetQuestionBox").addClass("anim_quickFadeOut");
  });

  if (questions.questions.length == 0) {
    $("#toggleQuestionButton").css("display", "none");
    $("#toggleQuestionBox").css("display", "none");
    $("#resetQuestionButton").css("display", "none");
    $("#resetQuestionBox").css("display", "none");
  }

  $("#expoButtonReview").click(function() {
    questionReview();
  });

  $("#expoButtonRetry").click(function() {
    questionRetry();
  });

  $("#expoButtonContinue").click(function() {
    questionContinue();
  });

  $("#hideQuestionButton").click(function() {
    minimizeQuestionPanel();
  });

  $("#showQuestionButton").click(function() {
    maximizeQuestionPanel();
  });

  $("#hideQuestionButton").hover(function() {
    $("#hideQuestionButtonLabel").removeClass("anim_quickFadeOut");
    $("#hideQuestionButtonLabel").addClass("anim_quickFadeIn");
  }, function() {
    $("#hideQuestionButtonLabel").removeClass("anim_quickFadeIn");
    $("#hideQuestionButtonLabel").addClass("anim_quickFadeOut");
  });

  $("#showQuestionButton").hover(function() {
    $("#showQuestionButtonLabel").removeClass("anim_quickFadeOut");
    $("#showQuestionButtonLabel").addClass("anim_quickFadeIn");
  }, function() {
    $("#showQuestionButtonLabel").removeClass("anim_quickFadeIn");
    $("#showQuestionButtonLabel").addClass("anim_quickFadeOut");
  });

  $("#scoreBox").hover(function() {
    $("#scoreInfo").removeClass("anim_quickFadeOut");
    $("#scoreInfo").addClass("anim_quickFadeIn");
  }, function() {
    $("#scoreInfo").removeClass("anim_quickFadeIn");
    $("#scoreInfo").addClass("anim_quickFadeOut");
  });

  setVolume();
  resizeWindow();
  updateScore();
}
}




function togglecc() {
  $('#cc').toggleClass('on');
  $("video")[0].textTracks[0].mode = $("#cc").hasClass('on') ? 'showing' : 'hidden';
}

function cconce() {
  track = document.createElement("track");
  track.default = "default";
  track.kind = "captions";
  track.label = "English";
  track.srclang = "en";
  var [quizid, author] = getparams();

  if (window.location.toString().indexOf("bookMaker") > -1) {
    track.src = "media/video.vtt";
  } else {
    track.src = "/vq/vqLib/DAL/?vtt&author=" + author + "&quizid=" + quizid;
  }

  $("video")[0].appendChild(track);
	togglecc();
}

function addVideoSource() {
  var [quizid, author] = getparams();
  addByAuthorQuizid(author, quizid);

  function addByAuthorQuizid(author, quizid) {
    $('#videoBox').append($('<source>', {
      src: '../users/'+author+'/'+quizid+'/media/video.mp4'
    }));
    $('#videoBox').append($('<source>', {
      src: '../users/'+author+'/'+quizid+'/media/video.m4v'
    }));
  }
}

function metadataLoaded() { // Called by 1 function: loadButtons()
  if (userData.watchData[0] == null) {
    userData.watchData = [];
    for (var i = 0; i <= video.duration; i++) {
      userData.watchData.push(0);
    }
  }
  for (var i = 0; i < questions.questions.length; i++) {
    $("#questionMarker" + i).css("left", ((questions.questions[i].startTime / video.duration * 100) - 1.4) + "%");
  }
}

// Better than parseInt() in that it detects the first integer in a string even if it starts with something that is not a number.  Still returns NaN if no integers are found.
function betterParseInt(s) { // Called by 0 functions:
  var str = s + "";
  while (isNaN(parseInt(str)) && str.length > 0) {
    str = str.substring(1, str.length);
  }
  return parseInt(str);
}

function prepQuestionScreen() { // Called by 1 function: loadButtons()
  for (var i = 0; i < 5; i++) {
    $("#questionBoxContents").append("<div id='answerBox" + i + "' class='answerBox text fs-28'></div>");
    $("#answerBox" + i).append("<div id='answerIcon" + i + "' class='answerIcon btn'></div>");
    $("#answerBox" + i).append("<div id='answerText" + i + "' class='answerText'></div>");
    $("#answerBox" + i).css("top", (37.5 + 12 * i) + "%");
    initAnswerClickEvent(i);
  }
  for (var i = 0; i < 100; i++) {
    $("#fillInPanels").append('<div id="fillInPanel' + i + '" class="fillInPanel">');
    $("#fillInPanel" + i).append('<div id="fillInPanelText' + i + '" class="fillInPanelText text fs-36"></div>')
  }
  resizeWindow();
}

function initAnswerClickEvent(i) { // Called by 1 function: prepQuestionScreen()
  $("#answerBox" + i).click(function() {
    selectAnswer(i);
  });
}

function selectAnswer(n) { // Called by 1 function: initAnswerClickEvent()
  if (showingQuestion && userData.answerData[currentQuestion].answers.indexOf(n) == -1) {
    var q = questions.questions[currentQuestion];
    var t = q.type;
    answerData[currentQuestion][n] = true;
    userData.answerData[currentQuestion].answers.push(n);
    var isCorrect = false;
    if (q.correctAnswer == n + 1) {
      answerCorrect(n);
      isCorrect = true;
    } else {
      answerIncorrect(n);
    }

    // Fade out non-selected answers
    for (var i = 0; i < 5; i++) {
      if (i != n) {
        $("#answerBox" + i).addClass("anim_answerFadeOut");
      }
    }
    // Animate correct answer to the top
    $("#answerBox" + n).addClass("anim_answerToTop");

    // Show expository text
    if (questions.questions[currentQuestion].expoText === undefined) {
      $("#expoText").text(isCorrect ? "Good job!" : "Not quite...");
    } else {
      if (questions.questions[currentQuestion].expoText[n] == "") {
        $("#expoText").text(isCorrect ? "Good job!" : "Not quite...");
      } else {
        $("#expoText").text(questions.questions[currentQuestion].expoText[n]);
      }
    }
    setTimeout(function() {
      $("#expoBox").addClass("anim_expoFadeIn");
    }, 600);

    saveWatchData();
  }
}

function answerCorrect(n) { // Called by 3 functions: selectAnswer(), submitFillAnswer() & submitShortResponse
  // Correct answer :D
  var t = questions.questions[currentQuestion].type;
  if (t == "mc") {
    $("#answerIcon" + n).removeClass("anim_spinButton");
    $("#answerIcon" + n).removeClass("iconCorrect");
    $("#answerIcon" + n).removeClass("iconWrong");
    setTimeout(function() {
      $("#answerIcon" + n).addClass("anim_spinButton");
      $("#answerIcon" + n).addClass("iconCorrect");
    }, 25);
  } else if (t == "fitb") {
    revealAllLetters();
    $("#fillInAnswer").blur();
  }
  animateAnswerCorrect(currentQuestion);
  var numTries = userData.answerData[currentQuestion].answers.length;
  userData.answerData[currentQuestion].correct = true;
  userData.answerData[currentQuestion].score = Math.pow(.75, numTries - 1);
  // Check if finished
  if (checkFinished()) {
    setTimeout(function() {
      completeQuiz();
    }, 1200);
  }
  $("#expoTitle").text("Correct");
  $("#expoTitle").css("color", "#2cb674");
  $("#expoText").css("color", "#2cb674");
  $("#expoButtonReview").css("visibility", "hidden");
  $("#expoButtonRetry").css("visibility", "hidden");
  $("#expoButtonContinue").css("visibility", "visible");
  // Update score
  var oldScore = userScore;
  updateScore();
  var pointsEarned = userScore - oldScore;
  $("#scoreBubbleText").text("+" + pointsEarned);
  $("#scoreBubble").removeClass("anim_scoreBubbleIn");
  setTimeout(function() {
    $("#scoreBubble").addClass("anim_scoreBubbleIn");
  }, 25);
}

function animateAnswerCorrect(n) { // Called by 2 functions: loadButtons() & answerCorrect()
  $("#questionButton" + n).removeClass("anim_spinButton");
  setTimeout(function() {
    $("#questionButton" + n).addClass("anim_spinButton");
    setTimeout(function() {
      // $("#questionButtonText" + n).text(""); //To Set Back To Score Not Appearing in Bubbles
      $("#questionButtonText" + n).text((userData.answerData[n].score * 100).toFixed(0) + '%'); //To Set Back To Score Appearing in Bubbles
      $("#questionButtonIcon" + n).removeClass("iconWrong");
      $("#questionButtonIcon" + n).addClass("iconCorrect");
    }, 62.5);
  }, 25);
  $("#questionMarker" + n).addClass("anim_foldQuestionMarker");
}

function answerIncorrect(n) { // Called by 2 functions: selectAnswer() & submitFillAnswer()
  // Wrong answer
  var t = questions.questions[currentQuestion].type;
  $("#questionButtonText" + currentQuestion).text("");
  $("#questionButton" + currentQuestion).removeClass("anim_spinButton");
  setTimeout(function() {
    $("#questionButton" + currentQuestion).addClass("anim_spinButton");
    setTimeout(function() {
      $("#questionButtonText" + currentQuestion).text((userData.answerData[currentQuestion].score * 100).toFixed(0) + '%'); //Setting score to text of bubble
      $("#questionButtonIcon" + currentQuestion).removeClass("iconCorrect");
      $("#questionButtonIcon" + currentQuestion).addClass("iconWrong");
    }, 62.5);
  }, 25);
  if (t == "mc") {
    $("#answerIcon" + n).removeClass("anim_spinButton");
    $("#answerIcon" + n).removeClass("iconCorrect");
    $("#answerIcon" + n).removeClass("iconWrong");
    setTimeout(function() {
      $("#answerIcon" + n).addClass("anim_spinButton");
      $("#answerIcon" + n).addClass("iconWrong");
    }, 25);
  } else if (t == "fitb") {
    $("#fillInAnswer").blur();
  }
  $("#expoTitle").text("Incorrect");
  $("#expoTitle").css("color", "#eb2529");
  $("#expoText").css("color", "#eb2529");
  $("#expoButtonReview").css("visibility", "visible");
  $("#expoButtonRetry").css("visibility", "visible");
  $("#expoButtonContinue").css("visibility", "visible");
}

function questionReview() { // Called by 1 function: loadButtons()
  hideQuestionPanel();
  if (questions.questions[currentQuestion].wrongTimeSet) {
    video.currentTime = questions.questions[currentQuestion].wrongTime;
    currentQuestion = -1;
  }
  setTimeout(function() {
    playVideo();
  }, 250);
}

function questionRetry() { // Called by 1 function: loadButtons()
  setQuestion(currentQuestion);
}

function questionContinue() { // Called by 1 function: loadButtons()
  hideQuestionPanel();
  setTimeout(function() {
    playVideo();
  }, 250);
}

function checkFinished() { // Called by 2 functions: loadButtons() & answerCorrect()
  if (userData.answerData.length > 0) {
    for (var i = 0; i < userData.answerData.length; i++) {
      if (!userData.answerData[i].correct) {
        return false;
      }
    }
    return true;
  } else {
    var seconds = 0;
    for (var i = 0; i < video.duration; i++) {
      if (userData.watchData[i] > 0) {
        seconds++;
      }
    }

    if (seconds > .8 * video.duration) {
      return true;
    }
    return false;
  }
}

function completeQuiz() { // Called by 3 functions: loadButtons(), answerCorrect() & recordTimeWatched()
  var n = questions.questions.length;
  if (n == 1) {
    exitButton(0, 500);
  } else {
    for (var i = 0; i < n; i++) {
      exitButton(i, i * (500 / (n - 1)));
    }
  }
  var mistakes = 0;
  for (var i = 0; i < n; i++) {
    mistakes += (userData.answerData[i].answers.length - 1);
  }
  if (mistakes == 0 && permissionData.isPublic != true) {
    $("#gameCompleteText").text("Completed quiz without any mistakes! Perfect!");
  } else {
    $("#gameCompleteText").text("Quiz complete!");
  }
  if (n > 0) {
    // There are some questions
    setTimeout(function() {
      $("#gameCompleteText").addClass("anim_gameCompleteTextShow");
    }, 1250);
  } else {
    // No questions
  }

  if (permissionData.isPublic == true) {
    setTimeout(function() {
      $("#resetQuestionButton").css("visibility", "visible");
      $("#resetQuestionButton").removeClass("anim_resetQuestionHide");
      $("#resetQuestionButton").addClass("anim_resetQuestionShow");
    }, 2000);
  }
  if (!userData.completeDate) {
    userData.completeDate = new Date();
  }
  quizComplete = true;
  if (permissionData.isPublic != true) {
    loadUserData();
  }
  saveUserData();
  saveLocalData();
}

function resetQuestions() { // Called by 2 functions: loadButtons() & completeQuiz()
  // Hide reset button
  $("#resetQuestionButton").removeClass("anim_resetQuestionShow");

  // Hide game complete text
  $("#gameCompleteText").removeClass("anim_gameCompleteTextShow");
  for (var i = 0; i < userData.answerData.length; i++) {
    userData.answerData[i].answers = [];
    userData.answerData[i].correct = false;
    userData.answerData[i].score = 0;
    $("#questionButtonText" + i).text("" + (i + 1));
  }
  $(".questionButton").removeClass("anim_buttonExit");
  $(".questionButton").removeClass("anim_spinButton");
  $(".questionButtonIcon").removeClass("iconCorrect");
  $(".questionButtonIcon").removeClass("iconWrong");
  $(".questionMarker").removeClass("anim_foldQuestionMarker");
}

function exitButton(i, delay) { // Called by 1 function: completeQuiz()
  setTimeout(function() {
    $("#questionButton" + i).addClass("anim_buttonExit");
  }, delay);
}

function setQuestion(n) { // Called by 2 functions: questionRetry() & initQuestionClickEvent
  if (!userData.answerData[n].correct && showingQuestions) {
    // Hide expository text

    $("#expoBox").removeClass("anim_expoFadeIn");
    $("#expoButtonReview").css("visibility", "hidden");
    $("#expoButtonRetry").css("visibility", "hidden");
    $("#expoButtonContinue").css("visibility", "hidden");
    $(".answerBox").removeClass("anim_answerFadeOut");
    $(".answerBox").removeClass("anim_answerToTop");

    if (!showingQuestion) {
      showQuestionPanel();
    }
    pauseVideo();
    currentQuestion = n;
    $("#questionText").html(urlify((n+1) + '. ' + questions.questions[n].questionText));
    $("#smallQuestionText").text(questions.questions[n].questionText);
    $(".answerIcon").removeClass("anim_spinButton");
    $(".answerIcon").removeClass("iconCorrect");
    $(".answerIcon").removeClass("iconWrong");
    $("#fillInAnswer").val("");
    clearInterval(letterFlipInterval);
    $(".anim_letterPanelSpin").removeClass("anim_letterPanelSpin");
    var t = questions.questions[n].type;

    //Dynamic Size Fixes
    $("#questionText").removeClass("srFix");

    if (t == "mc") {
      $(".fillInPanel").css("opacity", 0);
      $(".fillInPanel").css("pointer-events", "none");
      $("#fillInAnswer").css("opacity", 0);
      $("#fillInAnswer").css("pointer-events", "none");
      for (var i = 0; i < 5; i++) {
        if (questions.questions[n].answerText[i] != "") {
          $("#answerText" + i).text(questions.questions[n].answerText[i]);
          $("#answerBox" + i).css("opacity", 1);
          $("#answerBox" + i).css("pointer-events", "all");
        } else {
          $("#answerText" + i).text("");
          $("#answerBox" + i).css("opacity", 0);
          $("#answerBox" + i).css("pointer-events", "none");
        }
        var answerChosen = answerData[currentQuestion][i]; // Old way
        answerChosen = (userData.answerData[currentQuestion].answers.indexOf(i) != -1);
        if (answerChosen) {
          if (questions.questions[currentQuestion].correctAnswer == i + 1) {
            $("#answerIcon" + i).addClass("iconCorrect");
          } else {
            $("#answerIcon" + i).addClass("iconWrong");
          }
        }
      }
    } else if (t == "fitb") {
      $(".answerBox").css("opacity", 0);
      $(".answerBox").css("pointer-events", "none");
      $(".fillInPanel").css("opacity", 1);
      $(".fillInPanel").css("pointer-events", "auto");
      $("#fillInAnswer").css("opacity", 1);
      $("#fillInAnswer").css("pointer-events", "auto");
      $("#fillInAnswer").removeClass("anim_quickFadeOut");
      // Divide words into lines with line breaks
      var words = questions.questions[n].answerText[0].split(" ");
      var lines = [""];
      currentLine = 0;
      for (var i = 0; i < words.length; i++) {
        // Check if new word causes overflow
        if (lines[currentLine].length + words[i].length + 1 > 20) {
          currentLine++;
          lines[currentLine] = "";
        }
        // Add new word, adding a space if a word already exists in this line
        if (lines[currentLine] == "") {
          lines[currentLine] += words[i];
        } else {
          lines[currentLine] += " " + words[i];
        }
      }
      letterPanels = [];
      // Position panels
      for (var i = 0; i < 5; i++) {
        var rows = lines.length;
        if (i < rows) {
          var cols = lines[i].length;
          for (var j = 0; j < 20; j++) {
            var panel = $("#fillInPanel" + (20 * i + j));
            var panelText = $("#fillInPanelText" + (20 * i + j));
            if (j < cols && lines[i].charAt(j) != " ") {
              var letter = lines[i].charAt(j).toUpperCase();
              letterPanels.push({
                "pos": 20 * i + j,
                "letter": letter
              });
              panelText.text("?");
              panelText.css("color", "#808080");
              panel.css({
                'left': (5 * j + 2.5 * (20 - cols)) + "%",
                'top': (20 * i) + "%"
              });
            } else {
              panel.css("opacity", 0);
            }
          }
        } else {
          for (var j = 0; j < 20; j++) {
            var panel = $("#fillInPanel" + (20 * i + j));
            var panelText = $("#fillInPanelText" + (20 * i + j));
            panel.css("opacity", 0);
          }
        }
      }
      $("#fillInAnswer").focus();
      letterFlipInterval = setInterval(function() {
        revealRandomLetter();
      }, 2000);
    } else if (t == "sr") {
      $(".answerBox").css("opacity", 0);
      $(".answerBox").css("pointer-events", "none");
      $(".fillInPanel").css("opacity", 0);
      $(".fillInPanel").css("pointer-events", "none");
      $("#fillInAnswer").css("opacity", 1);
      $("#fillInAnswer").css("pointer-events", "auto");
      $("#fillInAnswer").removeClass("anim_quickFadeOut");
      $("#questionText").addClass("srFix");
    }
  }
}

function submitTextAnswer(answer) { // Called by 1 function: loadButtons()
  var qtype = questions.questions[currentQuestion].type;
  if (qtype == "fitb") {
    submitFillAnswer(answer);
  } else {
    submitShortResponse(answer);
  }
}

function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    })
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
}

function submitFillAnswer(answer) { // Called by 1 function: submitTextAnswer()
  clearInterval(letterFlipInterval);
  var isCorrect = false;
  userData.answerData[currentQuestion].answers.push(0);
  if (answer.toLowerCase() == questions.questions[currentQuestion].answerText[0].toLowerCase()) {
    // Correct
    answerCorrect(0);
    isCorrect = true;
  } else {
    // Incorrect
    answerIncorrect(0);
  }
  // Hide text input
  $("#fillInAnswer").addClass("anim_quickFadeOut");
  // Show expository text
  if (questions.questions[currentQuestion].expoText === undefined) {
    $("#expoText").text(isCorrect ? "Good job!" : "Not quite...");
  } else {
    if (questions.questions[currentQuestion].expoText[0] == "") {
      $("#expoText").text(isCorrect ? "Good job!" : "Not quite...");
    } else {
      $("#expoText").text(questions.questions[currentQuestion].expoText[0]);
    }
  }
  $("#expoBox").addClass("anim_expoFadeIn");
  saveLocalData();
}

function submitShortResponse(answer) { // Called by 1 function: submitTextAnswer()
  userData.answerData[currentQuestion].answers.push(0);
  userData.responses[currentQuestion] = answer;
  answerCorrect(0);
  isCorrect = true;
  // Hide text input
  $("#fillInAnswer").addClass("anim_quickFadeOut");
  // Show expository text
  $("#expoText").text("Your answer has been recorded.");
  $("#expoBox").addClass("anim_expoFadeIn");
  saveLocalData();
}

function revealRandomLetter() { // Called by 1 function: setQuestion()
  if (letterPanels.length > 0) {
    var r = Math.floor(letterPanels.length * Math.random());
    revealLetter(r);
  }
}

function revealAllLetters() { // Called by 1 function: answerCorrect()
  var l = letterPanels.length;
  for (var i = 0; i < l; i++) {
    revealLetter(0); //	Should this be (i)? Is this a typo? -Tony
  }
}

function revealLetter(r) { // Called by 2 functions: revealRandomLetter() & revealAllLetters()
  l = letterPanels[r];
  $("#fillInPanel" + l.pos).addClass("anim_letterPanelSpin");
  $("#fillInPanelText" + l.pos).text(l.letter);
  $("#fillInPanelText" + l.pos).css("color", "#ffffff");
  letterPanels.splice(r, 1);
}

function showQuestionPanel() { // Called by 1 function: setQuestion()
  $('#quizBank').show();
  showingQuestion = true;
  $("#questionBox").removeClass("anim_questionBoxHide");
  $("#questionBox").addClass("anim_questionBoxShow");
  $("#videoBox").removeClass("anim_unblurVideo");
  $("#videoBox").addClass("anim_blurVideo");
}

function hideQuestionPanel() { // Called by 5 functions: questionReview(), questionContinue(), playVideo(), vidSeek() & hideQuestions()
  $('#quizBank').hide();
  maximizeQuestionPanel();
  disableClicks = true;
  showingQuestion = false;
  $("#questionBox").removeClass("anim_questionBoxShow");
  $("#questionBox").addClass("anim_questionBoxHide");
  $("#fillInAnswer").val("");
  clearInterval(letterFlipInterval);
  $(".anim_letterPanelSpin").removeClass("anim_letterPanelSpin");
  setTimeout(function() {
    disableClicks = false;
  }, 250);
  $("#videoBox").removeClass("anim_blurVideo");
  $("#videoBox").addClass("anim_unblurVideo");
}

function minimizeQuestionPanel() { // Called by 1 function: loadButtons()
  $("#questionBoxContents").removeClass("anim_maximizeQuestionBox");
  $("#questionBoxContents").addClass("anim_minimizeQuestionBox");
  $("#videoBox").removeClass("anim_blurVideo");
  $("#videoBox").addClass("anim_unblurVideo");
  $("#smallQuestionBox").removeClass("anim_hideSmallQuestionBox");
  $("#smallQuestionBox").addClass("anim_showSmallQuestionBox");
}

function maximizeQuestionPanel() { // Called by 2 functions: loadButtons() & hideQuestionPanel()
  $("#questionBoxContents").removeClass("anim_minimizeQuestionBox");
  $("#questionBoxContents").addClass("anim_maximizeQuestionBox");
  $("#videoBox").removeClass("anim_unblurVideo");
  $("#videoBox").addClass("anim_blurVideo");
  $("#smallQuestionBox").removeClass("anim_showSmallQuestionBox");
  $("#smallQuestionBox").addClass("anim_hideSmallQuestionBox");
}

function makeQuestionButtons() { // Called by 1 function: loadButtons()
  var qCount = questions.questions.length;

  for (var i = 0; i < qCount; i++) {
    var q = questions.questions[i];
    var questionAnswerData = [];
    for (var j = 0; j < 5; j++) {
      if (q.answerText[j] != "") {
        questionAnswerData.push(false);

      }
    }

    answerData.push(questionAnswerData);

    // Question button
    $("#buttonBank").append("<div id='questionButton" + i + "' class='questionButton'></div>");
    $("#questionButton" + i).append("<div id='questionButtonText" + i + "' class='questionButtonText text fs-30'>" + (i + 1) + "</div>");
    $("#questionButton" + i).append("<div id='questionButtonIcon" + i + "' class='questionButtonIcon'></div>");
    $("#questionButton" + i).css("left", (50.9375 - 2.5 * qCount + 5 * i) + "%");
    initQuestionClickEvent(i);
    // Question marker on the timeline
    $("#questionMarkers").append("<div id='questionMarker" + i + "' class='questionMarker'></div>")
    $("#questionMarker" + i).append("<div id='questionMarkerText" + i + "' class='questionMarkerText text fs-18'>" + (i + 1) + "</div>");
  }
  resizeWindow();
}

function initQuestionClickEvent(i) { // Called by 1 function: makeQuestionButtons()
  $("#questionButton" + i).click(function() {
    if (!userData.answerData[i].correct && !disableClicks) {
      setQuestion(i);
      recordTimeWatched();
      video.currentTime = questions.questions[i].startTime;
      watchStart = Math.round(video.currentTime);
      pauseVideo();
    }
  });
}

function playPause() { // Called by 2 functions: loadButtons() & hideQuestions()
  if (video.paused) {
    playVideo();
  } else {
    if (Date.now() - playPause.lastTime > 700){
      pauseVideo();
		}
  }
  playPause.lastTime = Date.now();
}

function playVideo() { // Called by 3 functions: questionReview(), questionContinue() & playPause()
  video.play();
  $("#bigPlay").removeClass("playState");
  $("#videoPlayPause").removeClass("playState");
  //$("#videoPlayPause").addClass("pauseState");
  if (showingQuestion) {
    hideQuestionPanel();
  }
}

function pauseVideo() { // Called by 4 functions: setQuestion(), initQuestionClickEvent(), playPause() & videoEnded()
  video.pause();
  $("#bigPlay").addClass("playState");
  //$("#videoPlayPause").removeClass("pauseState");
  $("#videoPlayPause").addClass("playState");
  // Record end time
  recordTimeWatched();
}

function vidSeek() { // Called by 1 function: loadButtons()
  // Record time watched first
  recordTimeWatched();
  var seekto = video.duration * ($("#seekSlider").val() / 100);
  video.currentTime = seekto;
  watchStart = Math.round(video.currentTime);
  if (showingQuestion) {
    hideQuestionPanel();
  }
  currentQuestion = -1;
}

function getWatchPercentage() { // Called by 1 function: recordTimeWatched()
  var total = 0;
  for (var i = 0; i < Math.floor(video.duration); i++) {
    if (userData.watchData[i] > 0) {
      total++;
    }
  }
console.log(userData.watchData,video.duration)

  return   Math.floor((total / Math.floor(video.duration)) * 100);
}

function recordTimeWatched() { // Called by 5 functions: initQuestionClickEvent() pauseVideo() vidSeek() seekTimeUpdate() & videoEnded()
  var now = Math.min(Math.floor(video.duration), Math.floor(video.currentTime));
  var changed = false;
  for (var i = watchStart; i < now; i++) {
    userData.watchData[i]++;
    changed = true;
  }
  watchStart = now;
  if (changed) {
    updateScore();
  }
  // Update watch percentage
  if (questions.questions.length == 0) {
    var watchPct = getWatchPercentage();
    $("#noQuestionText").text("This quiz has no questions. You've watched " + watchPct + "% of the video." + (watchPct > 80 ? " Completed!" : ""));
    if (watchPct > 80 && !recordedCompletion && questions.questions.length == 0) {
      // Complete
      recordedCompletion = true;
      completeQuiz();
      $("#noQuestionText").addClass("anim_turnGreen");
    }
  }
}

function showPerformance(){
	if (Math.random()<.1) showWatchData2();
	var time =  'Time :' + getWatchPercentage().toFixed(2).padStart(6,' ') + '%\n';
	var ques =  'Ques.:' + (100*getQuesGrade()).toFixed(2).padStart(6,' ') + '%\n';
	var grade = 'Grade:' + (100*getGrade()).toFixed(2).padStart(6,' ')+'%\n';
	var score = 'Score:' + (userScore/20).toFixed(2).padStart(6,' ')+'%';
	$('#grade').html('<pre>' + time + ques + grade + '</pre>');
	$('#grade').css({'font-size':'.5REM'});
	function showWatchData() {	//	Slow
		console.log('showatdat');
		bar = '';
		for(var i = 0; i < userData.watchData.length; i++) {
			var watched = userData.watchData[i] > 0;
			var color = watched ? 'green' : 'red';
			var pixel = `<img src='vqPlayer/img/${color}.png' style='width:1px;height:1px'>`;
			bar += pixel;
		}
		$('#seekSlider2').html(bar)
	}
	function showWatchData2() {
		var w = userData.watchData
		var s = switchpos(w);
		var l = levels(s);
		var p = levels2percent(l);
		var bar;
		bar = "<table><tr>";
		var color = ['darkgreen', 'darkred'];
		if (w[0] == 0) color = ['darkred', 'darkgreen'];
		for(var i = 0 ; i < l.length ; i++ ) {
			bar += `<td width='${Math.round(p[i])}%' bgcolor='${color[i%2]}'></td>`;
		}
		bar += "</tr></table>";
		console.log(bar);
		$('#seekSlider2').html(bar);
		function switchpos(w) {
			var ret = [];
			ret.push(0);
			for(var i = 1; i < w.length; i++) {
				if ((w[i]==0) != (w[i-1]==0))
					ret.push(i);
			}
			ret.push(w.length);
			return ret;
		}
		function levels(s) {
			var ret = [];
			for(var i = 1 ; i < s.length ; i++)
				ret.push(s[i]-s[i-1]);
			return ret;
		}
		function levels2percent(levels) {
			var sum = levels.reduce((a,b)=>a+b,0);
			return levels.map(x=>100*x/sum);
		}
	}
}

function seekTimeUpdate(){ // Called by 1 function: loadButtons()
	// showPerformance();
  var currentTime = video.currentTime;
  var currentPct = currentTime * (100 / video.duration);
  $("#seekSlider").val(currentPct);
  $("#seekSliderThumb").css("left", (currentPct * .98) + "%");
  $("#timeDisplayText").text(formatTime(currentTime));
  // Check for question display
  for (var i = 0; i < questions.questions.length; i++) {
    if (currentTime > questions.questions[i].startTime && currentTime - questions.questions[i].startTime < 1 && currentQuestion < i) {
      setQuestion(i);
    }
  }
  // Record
  recordTimeWatched();
  // Save?
  var currentDate = new Date().getTime();
  userData.lastAccessDate = new Date();
  if (currentDate - lastSaved > 15000) {
    saveWatchData();
    lastSaved = currentDate;
  }
}

function videoEnded() { // Called by 1 function: loadButtons()
  pauseVideo();
  userData.watchData[userData.watchData.length - 1]++;
  recordTimeWatched();
  saveWatchData();
}

function videoMute() { // Called by 1 function: loadButtons()
  if (video.muted) {
    video.muted = false;
    $("#muteButton").css("background-image", "url(img/button_unmute.svg)");
  } else {
    video.muted = true;
    $("#muteButton").css("background-image", "url(img/button_mute.svg)");
  }
}

function setVolume() { // Called by 1 function: loadButtons()
  video.volume = $("#volumeSlider").val() / 100;
  $("#volumeSliderThumb").css("left", ($("#volumeSlider").val() * .855) + "%");
}

function formatTime(n) { // Called by 1 function: seekTimeUpdate()
  var m = Math.floor(n);
  var hr = Math.floor(m / 3600);
  m -= 3600 * hr;
  var min = Math.floor(m / 60);
  m -= 60 * min;
  var sec = m;
  return (hr > 0 ? hr + ":" : "") + (min < 10 && hr != 0 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
}

function saveWatchData() { // Called by 3 functions: selectAnswer(), seekTimeUpdate() & videoEnded()
  if (permissionData.isPublic == true) {
    // saveLocalData();
  } else {
    var str = JSON.stringify(userData);
    saveData(str);
  }
}

function saveUserData() { // Called by 2 functions: completeQuiz() & saveData()
  if (userData.attempts.length == 0) {
    var wrongAnswers = [];
    for (var i = 0; i < userData.answerData.length; i++) {
      var q = userData.answerData[i].answers;
      wrongAnswers.push(q.length - 1);
    }
    userData.attempts.push(wrongAnswers);
  }
  var str = JSON.stringify(userData);
  saveData(str);
}

function getQuesGrade() {	// Called by 1 function: saveData()
	var ans = userData.answerData
	var total = ans.length;
	var right = ans.map(function(x){return x.score}).reduce(function(sum,item){return sum+item},0);
	return right / total;
}

function folderGrade() { // Called by function: saveData()
	// var [quizid, author, folder, LTI] = getparams();
	// $.ajax({
  //       url: ,
  //       data: { author, folder, consumer: 'me', grade: ''},
	// 	success: ltifoldergrade
	// });
	// function ltifoldergrade(grade) {
	// 	Lti.submit(grade,JSON.parse(LTI))
	// }
}

function getGrade() { // Called by 1 function: saveData()
	return avg([getWatchPercentage()/100, getQuesGrade()]);
	function avg(nums) {
		var sum = 0;
		var count = 0;
		for(var i = 0; i < nums.length; i++) {
			if(!isNaN(nums[i])) {
				sum += nums[i];
				count++
			}
		}
		return sum / count;
	}
}

function saveData(str) { // Called by 2 functions: saveWatchData() & saveUserData()
	var [quizid, author, folder, LTI] = getparams();
	if (LTI != null && LTI != 'null' && LTI != '') {
		if (folder == null || folder == ''){
			Lti.submit(getGrade(),JSON.parse(LTI));
		}

		if (folder != null){
			folderGrade();
		}
	}
    $.ajax({
				type: "POST",
        url: "../vqLib/api/saveUserData",
        data: {'userData': str,'vqBase':author+"/"+quizid+"/"},
        success: function (d) {
			       console.log('saveData : ' + d);
		},
        error: function (jqXHR, textStatus, errorThrown) { }
    });
}

function showQuestions() { // Called by 1 function: loadButtons()
  showingQuestions = true;
  $("#toggleQuestionButton").removeClass("anim_toggleQuestionsOff");
  $("#toggleQuestionButton").addClass("anim_toggleQuestionsOn");
  $("#questionMarkers").removeClass("anim_hideQuestionMarkers");
  $("#questionMarkers").addClass("anim_showQuestionMarkers");
  $("#buttonBank").removeClass("anim_hideQuestionMarkers");
  $("#buttonBank").addClass("anim_showQuestionMarkers");
}

function hideQuestions() { // Called by 1 function: loadButtons()
  showingQuestions = false;
  $("#toggleQuestionButton").removeClass("anim_toggleQuestionsOn");
  $("#toggleQuestionButton").addClass("anim_toggleQuestionsOff");
  $("#questionMarkers").removeClass("anim_showQuestionMarkers");
  $("#questionMarkers").addClass("anim_hideQuestionMarkers");
  $("#buttonBank").removeClass("anim_showQuestionMarkers");
  $("#buttonBank").addClass("anim_hideQuestionMarkers");
  if (showingQuestion) {
    hideQuestionPanel();
    if (video.paused) {
      playPause();
    }
  }
}

function saveLocalData() { // Called by 4 functions: completeQuiz(), submitFillAnswer(), submitShortResponse() & saveWatchData()

  progress.setKey(urlVars["key"], "done");

  try {
    if (urlVars["testing"] == "true") {
      console.log('\n' + "----------Key----------")
      console.log(progress.getKey(urlVars["key"]), urlVars["key"]);
      console.log("----------Key----------" + '\n')
    }

    window.parent.updateCompletion();
  } catch (e) {
  }
}

function updateScore() { // Called by 5 functions: getUserData() loadUserData() loadButtons() answerCorrect() & recordTimeWatched()

  var score = 0;
  // Compute score
  // Time watched
  //var watchedSeconds = 0;

  if (video) {

    score = getWatchPercentage() * 10;
    // Questions answered
    if (questions !== undefined) {
      if (questions.questions.length > 0) {
        var questionScore = 0;
        for (var i = 0; i < userData.answerData.length; i++) {
          questionScore += userData.answerData[i].score;
        }
        score += Math.round(questionScore / questions.questions.length * 1000);
      } else {
        score *= 2;
      }
    }

    var maxScore = 2000;
    var stars = [.5, .7, .9];
    for (var i = 0; i < stars.length; i++) {
      if (score >= stars[i] * maxScore) {
        $("#medal" + i).removeClass("medalGray").addClass("medalGold");
      } else {
        $("#medal" + i).removeClass("medalGold").addClass("medalGray");
      }
      $("#medal" + i).css("left", ((stars[i] * 100) - 2.5) + "%");
    }
    if (score > userData.bestScore) {
      userData.bestScore = score;
    }
    if (isNaN(score)) {
      score = 0;
    }
    userScore = score;
    $("#scoreNum").text(score);
    $("#scoreBar").css("width", (score / maxScore * 100) + "%");
  }
}
