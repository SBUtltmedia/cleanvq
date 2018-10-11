<?
function makePublic($body){
  $path = "../".$_REQUEST['path'];
  $isPublic = $_REQUEST['isPublic'];
  if ($isPublic == "true") {
    if (file_exists($path."/.htaccess")) {
      rename($path . "/.htaccess", $path . "/.htaccess_disabled");
    }
  } else {
    if (file_exists($path."/.htaccess_disabled")) {
      rename($path . "/.htaccess_disabled", $path . "/.htaccess");
    }
  }
}
?>
