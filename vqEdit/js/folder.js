var folders = [];
var allVideos = [];
var folderSelected = {
    "type": "",
    "id": -1
};

function initFolders(userData){
  console.log(userData)
  // Folders
  folders = [];
  allVideos = [];

  // First, make the folder objects
  for (var i = 0; i < userData.folders.length; i++) {
      var newFolder = {
          "name": userData.folders[i].name,
          "quizzes": [],
          "expand": userData.folders[i].expand === true
      };
      folders.push(newFolder);
  }

  for (var i = 0; i < userData.quizData.length; i++) {
      var added = false;

      for (var j = 0; j < userData.folders.length; j++) {
        var dirs = userData.folders[j].quizzes;
        if (dirs.indexOf(path) != -1) {
              folders[j].quizzes.push(i);
              added = true;
          }
      }

      allVideos.push(i);
  }
  console.log(allVideos)
}

// Show/hide folder view
function showFolderView() {
    if (!showingFolder) {
        $("#folderView").removeClass("anim_progressOut");
        $("#folderView").addClass("anim_progressIn");
        makeFolders();
        showingFolder = true;
        setFolderView("", -1);
    }
}

function hideFolderView() {
    if (showingFolder) {
        $("#folderView").removeClass("anim_progressIn");
        $("#folderView").addClass("anim_progressOut");
        showingFolder = false;
    }
}

function makeFolders() {
    $("#folderList").empty();
    // Folder divs

    for (var i = 0; i < folders.length; i++) {
        $("#folderList").append('<div id="folder' + i + '" class="folderItem btn folder"></div>');
        $("#folder" + i).append('<div id="folderBox' + i + '" class="folderBox"></div>');
        $("#folderBox" + i).append('<div id="folderIcon' + i + '" class="folderIcon"></div>');
        $("#folderBox" + i).append('<div id="folderName' + i + '" class="folderName text fs-28"></div>');
        $("#folderIcon" + i).append('<div id="folderNum' + i + '" class="folderNum text fs-20"></div>');
        $("#folderName" + i).text(folders[i].name);
        $("#folderNum" + i).text(folders[i].quizzes.length);
        initFolderClick(i);
    }
    // Quiz divs
    for (var i = 0; i < userData.quizData.length; i++) {
        $("#folderList").append('<div id="folderQuiz' + i + '" class="folderItem btn folderQuiz"></div>');
        $("#folderQuiz" + i).append('<div id="folderQuizBox' + i + '" class="folderQuizBox"></div>');
        $("#folderQuizBox" + i).append('<div class="folderQuizIcon"></div>');
        $("#folderQuizBox" + i).append('<div id="folderQuizName' + i + '" class="folderName text fs-28"><span class="fqName"></span> <span class="fqShared"></span></div>');
        $("#folderQuizName" + i + ">.fqName").text(userData.quizData[i].title);
        if (!userData.quizData[i].isOwner) {
            $("#folderQuizName" + i + ">.fqShared").text("Shared by " + userData.quizData[i].owner);
        }
        initFolderQuizClick(i);
    }

    updateFolders(false);
    updateFolderDropdown();
    resizeWindow();
}

function initFolderClick(i) {
    $("#folderIcon" + i).click(function (evt) {
        if (!folders[i].expand) {
            expandFolder(i);
        } else {
            collapseFolder(i);
        }
        evt.stopPropagation();
    });
    $("#folder" + i).click(function () {
        setFolderView("folder", i);
    });
}

function updateVideos(id){
  var quiz = folders[id].quizzes;

  for (var i = 0; i < userData.quizData.length; i++) {
    if(quiz.indexOf(i) != -1){
      $("#folderInfo").append('<div id="folderListQuiz' + i + '" class="folderRel folderItem btn folderQuiz"></div>');
      $("#folderListQuiz" + i).append('<div id="folderListQuizBox' + i + '" class="folderQuizBox"></div>');
      $("#folderListQuizBox" + i).append('<div class="folderQuizIcon"></div>');
      $("#folderListQuizBox" + i).append('<div id="folderListQuizName' + i + '" class="folderNameRel folderName text fs-28"><span class="fqName"></span> <span class="fqShared"></span></div>');
      $("#folderListQuizName" + i + ">.fqName").text(userData.quizData[i].title);
      if (!userData.quizData[i].isOwner) {
          $("#folderListQuizName" + i + ">.fqShared").text("Shared by " + userData.quizData[i].owner);
      }
    }
  }

}

function expandFolder(id) {
    folders[id].expand = true;
    updateFolders(true);
}

function collapseFolder(id) {
    folders[id].expand = false;
    if (folderSelected.type == "quiz") {
        if (folders[id].quizzes.indexOf(folderSelected.id) != -1) {
            setFolderView("", -1);
        }
    }
    updateFolders(true);
}

function initFolderQuizClick(i) {
    $("#folderQuiz" + i).click(function () {
        setFolderView("quiz", i);
    });
}

function setFolderView(type, id) {
    folderSelected.type = type;
    folderSelected.id = id;
    $(".anim_folderSelected").removeClass("anim_folderSelected");
    $(".folderInfoPanel").css("visibility", "hidden");
    if (type == "quiz") {
        $("#folderQuizPanel").css("visibility", "visible");
        $("#folderQuiz" + id).addClass("anim_folderSelected");
        var folderID = -1;
        for (var i = 0; i < folders.length; i++) {
            if (folders[i].quizzes.indexOf(id) != -1) {
                folderID = i;
            }
        }
        $("#folderInfoSelect").val(folderID);
        $("#folderQuizTitle").text(userData.quizData[id].title);
        // Fade out edit button if user is not the owner
        if (userData.quizData[id].owner != userData.netID) {
            $("#folderInfoSubmit").css("opacity", ".25");
            $("#folderInfoSubmit").removeClass("btn");
        } else {
            $("#folderInfoSubmit").css("opacity", "1");
            $("#folderInfoSubmit").addClass("btn");
        }
    } else if (type == "folder") {
        $("#folderFolderPanel").css("visibility", "visible");
        $("#folder" + id).addClass("anim_folderSelected");
        $("#folderTitleInput").val(folders[folderSelected.id].name);
        $("#folderThumbNumber").text(folders[folderSelected.id].quizzes.length);
        if (folderSelected.id < folders.length - 1) {
            $(".folderDelete").css("opacity", "1");
            $("#folderDeleteButton").addClass("btn");
            $("#folderTitleInput").css("pointer-events", "auto");
        } else {
            $(".folderDelete").css("opacity", "0");
            $("#folderDeleteButton").removeClass("btn");
            $("#folderTitleInput").css("pointer-events", "none");
        }
    } else {
        $("#folderBlankPanel").css("visibility", "visible");
    }
}

function updateFolders(animate) {
    var count = -1;
    for (var i = 0; i < folders.length; i++) {
        count++;
        if (animate) {
            $("#folder" + i).animate({
                "top": (6 * count) + "%"
            }, 200);
        } else {
            $("#folder" + i).css("top", (6 * count) + "%");
        }
        // Expand the folders
        for (var j = 0; j < folders[i].quizzes.length; j++) {
            if (folders[i].expand) {
                count++;
            }
            var quizID = folders[i].quizzes[j];
            var newProps = {
                "top": (6 * count) + "%",
                "opacity": (folders[i].expand ? 1 : 0)
            };
            if (animate) {
                $("#folderQuiz" + quizID).animate(newProps, 200);
            } else {
                $("#folderQuiz" + quizID).css(newProps);
            }
        }
        $("#folderNum" + i).text(folders[i].quizzes.length);
        $("#folderName" + i).text(folders[i].name);
    }
}

function initFolderControls() {
    $("#folderReturn").click(function () {
        saveFolders();
        hideFolderView();
        showMenuView();
    })
    $("#folderInfoSelect").change(function () {
        if (folderSelected.type == "quiz") {
            var newVal = $("#folderInfoSelect").val();
            moveQuizToFolder(folderSelected.id, newVal);
        }
    });
    $("#folderInfoSubmit").click(function () {//alert()
        if (folderSelected.type == "quiz") {
            saveFolders();
            // Check permissions
            var owner = userData.quizData[folderSelected.id].owner;
            if (owner == userData.netID) {
                readOnly = false;
                loadExistingQuiz(folderSelected.id);
                hideFolderView();
            }
        }
    });
    $("#folderAddButton").click(function () {
        makeNewFolder();
    });
    $("#folderTitleInput").change(function () {
        if (folderSelected.type == "folder") {
            if (folderSelected.id != folders.length - 1) {
                var newTitle = $("#folderTitleInput").val();
                folders[folderSelected.id].name = newTitle;
                updateFolderDropdown();
                updateFolders(true);
                saveFolders();
            }
        }
    });
    $("#folderDeleteButton").click(function () {
        if (folderSelected.type == "folder") {
            deleteFolder(folderSelected.id);
        }
    });
}

function updateFolderDropdown() {
    // Folder dropdown
    $("#folderInfoSelect").empty();
    for (var i = 0; i < folders.length; i++) {
        $("#folderInfoSelect").append('<option value="' + i + '">' + folders[i].name + '</option>');
    }
}

function findQuizInFolders(quizID) {
    for (var i = 0; i < folders.length; i++) {
        for (var j = 0; j < folders[i].quizzes.length; j++) {
            if (folders[i].quizzes[j] == quizID) {
                return {
                    "folder": i,
                    "index": j
                };
            }
        }
    }
    return null;
}

function moveQuizToFolder(quizID, folderID) {
    var index = findQuizInFolders(quizID);
    if (index != null) {
        folders[index.folder].quizzes.splice(index.index, 1);
    }
    folders[folderID].quizzes.push(quizID);
    if (!folders[folderID].expand) {
        expandFolder(folderID);
    }
    updateFolders(true);
    saveFolders();
}

function makeNewFolder() {
    var newFolder = {
        "name": "New Folder",
        "quizzes": [],
        "expand": false
    };
    folders.splice(folders.length - 1, 0, newFolder);
    makeFolders();
    if (folderSelected.type == "quiz") {
        setFolderView(folderSelected.type, folderSelected.id);
    }
    saveFolders();
}

function deleteFolder(id) {
    if (id < folders.length - 1) {
        for (var i = 0; i < folders[id].quizzes.length; i++) {
            folders[folders.length - 1].quizzes.push(folders[id].quizzes[i]);
        }
        folders.splice(id, 1);
        makeFolders();
        setFolderView("", -1);
        saveFolders();
    }
}

function saveFolders() {
    var folderData = {
        "folders": []
    };
    // Save data for all folders except "Uncategorized", which is always the last folder
    for (var i = 0; i < folders.length - 1; i++) {
        var newFolder = {
            "name": folders[i].name,
            "quizzes": [],
            "expand": folders[i].expand
        };
        for (var j = 0; j < folders[i].quizzes.length; j++) {
            newFolder.quizzes.push(userData.quizData[folders[i].quizzes[j]].relativePath);
        }
        folderData.folders.push(newFolder);
    }

    var str = JSON.stringify(folderData);
    $.ajax({
        type: "POST",
        url: "../vqLib/api/saveFolderData",
        data: {
            "data": str
        }
    }).done(function (data) {

    });
}
