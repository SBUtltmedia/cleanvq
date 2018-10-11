<?
function loadFolderData(){
  $netID = $_SERVER['cn'];
  $path = "../../users/" . $netID . "/folders.json";
  if(file_exists($path)){
    $data = file_get_contents(injectUserPath($path));
  }else{
    $data = '{}';
  }
  print_r($data);
}
?>
