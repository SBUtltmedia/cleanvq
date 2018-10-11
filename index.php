<?
require("userCheck.php");
$LTI = urlencode(isset($_GET['lti']) ? $_GET['lti'] : json_encode($_POST));					//	Tony
$vqBase= $_GET['vqBase'];
$quizInfo=json_decode("{}");
$quizInfo->author="";
$quizInfo->quizid="";
$quizInfo->folder="";


$pathArray = preg_split("/\//",$vqBase);
if(preg_match("/[^\/]+\/folder/",$vqBase)===1){
	$quizInfo->folder=$pathArray[2];

	$app="vqFolder";


} else if(preg_match("/^vqEdit/",$vqBase)===1){

	$app="vqEdit";

}
// else if(preg_match("/^vqPlayer/",$vqBase)===1){
//
// 	$app="vqPlayer";
// 	if(!$quizInfo->folder)	$quizInfo->quizid=$pathArray[1];
//
// 	$quizInfo->author=$pathArray[0];
//
// }
// else{
// 	$app = 'vqLib';
// }

else{

	$app="vqPlayer";
	if(!$quizInfo->folder)	$quizInfo->quizid=$pathArray[1];

	$quizInfo->author=$pathArray[0];

	if($quizInfo->quizid == null && $quizInfo->author = ""){
		$app = 'vqLib';
	}

}

$appBase="$app";
$indexPage="$appBase/index.html";

$homeBase = "/".end(explode('/',dirname(__FILE__)))."/$appBase";

$quizInfoText=json_encode($quizInfo);
$HTML = file_get_contents("$indexPage");
$scriptText = <<<EOL
<base href="$homeBase/">
<script>
//	var LTI = $LTI;
var quizInfo =$quizInfoText;
var vqBase="$vqBase";
</script>
<script src='/login/js/lti.js'></script>
EOL;


$find = "<head>";
$augment = str_replace($find, "$find$scriptText", $HTML);

print ($augment);

?>
