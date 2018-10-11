<?
function loadUserData($body){

$path = explode("/api", dirname($_SERVER['SCRIPT_FILENAME']));
$path = $path[0];
print $path;
// Get netID
  $netID = $_SERVER['cn'];
  if ($netID=="") $netID= "japalmeri";
  $userDataFile= "../../users/".$_POST['vqBase']."data/" . $netID;
  $userData='{"watchData": [],"attempts": []}';

  // Make directory for that netID if it does not exist already
  if (!file_exists($userDataFile)) {




    file_put_contents($userDataFile, $userData);
  }else{
    $userData=file_get_contents($userDataFile);
  }

  $a = json_decode($userData);
  $a -> netID = $_SERVER['cn'];
  $a -> firstname = $_SERVER['givenName'];
  $a -> nickname = $_SERVER['nickname'];
  $a -> lastname = $_SERVER['sn'];
  print (json_encode($a));
}
?>
