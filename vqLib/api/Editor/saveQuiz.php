<?
function saveQuiz($body){
  $jsonData = $_POST['jsonData'];
  $type = $_POST['type'];
  $data=json_decode($jsonData);
  // if(property_exists($data,"videoPath")){
  //   // $data->videoPath =str_replace("/..","",$data->videoPath);
  //   // $data->videoPath =str_replace("../","",$data->videoPath);
  //   // $data->videoPath =str_replace("..","",$data->videoPath);
  //   // $data->videoPath ="../../".$data->videoPath;
  // }
  //$jsonData= json_encode($data);
print_r($data);
$pathArray = preg_split("/\//",$data->videoPath);

$path="../../users/${pathArray[0]}/${pathArray[1]}/json/$type.json";
//print($path);
file_put_contents($path, $jsonData);
}
?>
