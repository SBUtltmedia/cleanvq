<?php

$path = explode("/api", dirname($_SERVER['SCRIPT_FILENAME']));
$path = $path[0];
global $path;

require "$path/api/vendor/autoload.php";
require "$path/api/Editor/injectUserPath.php";
require "$path/api/Editor/login.php";
require "$path/api/Editor/upload.php";
require "$path/api/Editor/saveQuiz.php";
require "$path/api/Editor/deleteQuiz.php";
require "$path/api/Editor/saveQuizTotals.php";
require "$path/api/Editor/saveFolderData.php";
require "$path/api/Editor/loadFolderData.php";
require "$path/api/Editor/loadQuiz.php";
require "$path/api/Editor/loanQuiz.php";
require "$path/api/Editor/getQuizStats.php";
require "$path/api/Editor/makePublic.php";
require "$path/api/Editor/batchAddPermissions.php";
require "$path/api/Userdata/loadUserData.php";
require "$path/api/Userdata/saveUserData.php";
require "$path/api/Userdata/list.php";
require "$path/api/thumbnailer/index.php";

$app = new \Slim\Slim();
$body= $app->request()->getBody();

$app->get('/login', function (){

    login();
    exit;

});

$app->post('/upload', function (){
    global $body;

    upload($body);
    exit;

});

$app->post('/saveQuiz', function (){
    global $body;

    saveQuiz($body);
    exit;

});

$app->post('/saveFolderData', function (){
    global $body;

    saveFolderData($body);
    exit;

});

$app->get('/loadFolderData', function (){

    loadFolderData();
    exit;

});

$app->get('/loadQuiz', function (){

    loadQuiz();
    exit;

});

$app->get('/getQuizStats', function (){

    getQuizStats();
    exit;

});

$app->post('/saveQuizTotals', function (){
    global $body;

    saveQuizTotals($body);
    exit;

});

$app->get('/deleteQuiz', function (){

    deleteQuiz();
    exit;

});

$app->post('/loanQuiz', function (){ //Double Check
    global $body;

    loanQuiz($body);
    exit;

});

$app->post('/makePublic', function (){
    global $body;

    makePublic($body);
    exit;

});

$app->post('/batchAddPermissions', function (){
    global $body;

    batchAddPermissions($body);
    exit;

});

$app->post('/loadUserData', function (){ //Double Check
    global $body;

    loadUserData($body);
    exit;

});

$app->post('/saveUserData', function (){ //Double Check
    global $body;

    saveUserData($body);
    exit;

});

$app->get('/listAllVideos', function (){

    listAllVideos();
    exit;

});

$app->get('/thumbnail/:author/:quizid', function ($author,$quizid){

    thumbnail($author,$quizid);
    exit;

});

$app->run();
?>
