var users;

$(function() {
  fetchUserInfo();

  $("#header").on("click",function(){
    window.location.href = window.location.href.split('#')[0];
    makeEmGray();
    $("#videoSelector").addClass("hidden");
    $("#splash").removeClass("hidden");
  })
});

function fetchUserInfo(){
  $.ajax({
        url: "api/listAllVideos"
	}).done(function(data){
    users = JSON.parse(data);
    setDescription();
    makeEmGray();
    setUsers(users);
  });
}

function setDescription(){
  var link = window.location.href;
  var whichvq = link.split("vq")[1].split("/")[0];
  $("#description").html("The program is called IVQ and is an interactive video quiz tool. It features the use of multiple choice questions, fill in the blank, short answers to assess students during the videos. It also takes into account if they watched the whole video or not. The point of this is to merge quizzing and videos to make it easier for students to learn.");
  $("#links").html("Want to make your own quiz? Try <a href='https://apps.tlt.stonybrook.edu/vq"+whichvq +"/vqEdit/'>VQEdit</a>!");
  $("#credits").html("Credits: Jim Palmeri & <a href='https://github.com/RahulSondhi'>Rahul Sondhi</a>");
}

function setUsers(data){

  for(var i = 0; i < data.length; i++){
    var userContainer = $("<div></div>");
    userContainer.attr("class","userContainer "+data[i].id);
    userContainer.attr("onclick",'{makeEmGray();$("#splash").addClass("hidden");$("#videoSelector").removeClass("hidden");var change = $(this).children()[0];$(change).attr("src","media/hex_check_green.svg"); location.hash="'+data[i].id+'"; showVideos("'+i+'")}');

    var userImg = $("<img></img>");
    userImg.attr("class","userHex");
    userImg.attr("src","media/hex_check_gray.svg");

    var userTitle = $("<div></div>");
    userTitle.attr("class","userTitle");
    userTitle.html(data[i].id);

    userContainer.append(userImg);
    userContainer.append(userTitle);
    $("#users").append(userContainer);
  }

  checkLink(location.hash);
}

function makeEmGray(){
  $(".userContainer").each(function(){
    var change = $(this).children()[0];
    $(change).attr("src","media/hex_check_gray.svg");
  });
}

function checkLink(id){

  if(id === "" || id === "#"){
    makeEmGray();
    var find = $("#users").find(id.substr(1));
    console.log(find);
  }else{
    var find = $("#users").find(id.substr(1));
    var change = find.prevObject[0];
    var changeChild = $(change).children()[0];
    console.log(find);
    changeChild.click();
  }

}

function showVideos(data){

  var user = users[data];
  var number = user.number;
  var title = user.title;
  var duration = user.duration;
  var id = user.id;

  var link = window.location.href; // Saves the href (URL) of the current page
  var whichvq = link.split("vq")[1].split("/")[0];

  $("#videoSelector").html(" ");
  for(var i=0; i < number.length; i++){
    var videoContainer = $("<div></div>");
    videoContainer.attr("class","videoContainer");
    videoContainer.attr("onclick","{window.open('https://apps.tlt.stonybrook.edu/vq"+whichvq +"/users/"+id+"/"+number[i]+"','_self')}");

    var videoThumbnail = $("<img></img>");
    videoThumbnail.attr("class","videoThumbnail");
    videoThumbnail.attr("id",id+"-"+number[i]);

    var videoTitle = $("<div></div>");
    videoTitle.attr("class","videoTitle");
    videoTitle.html(title[i]);

    videoContainer.append(videoThumbnail);
    videoContainer.append(videoTitle);

    $("#videoSelector").append(videoContainer);
    getThumbnail(id+"-"+number[i],id,number[i]);
  }
}

function getThumbnail(div,id,number){
  $.ajax({
    url: "api/thumbnail/"+id+"/"+number
  }).done(function(data){
    $("#"+div).attr("src",data);
  });
}

// Function to hide the copyLinkBubble before the :
/*
function hideOrShowCopyBubble(){

    var x = document.getElementById("copyLinkBubble");
    var y = document.getElementById("");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}
*/
