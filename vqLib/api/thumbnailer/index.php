<?

function thumbnail($author,$quizid){
  $path=$author."/".$quizid;
  $basePath="../../users/${path}/";
  $png="${basePath}thumbnail.png";
  $vqPath="${basePath}media/video.mp4";
  if (!file_exists($png)) {

    $a= "/usr/local/bin/ffmpeg -y -i $vqPath -vf scale=320:-1 -ss 10 -vframes 1 $png 2>&1| grep -o -P \"(?<=Duration: ).*?(?=,)\"";
    $c= `$a 2>&1`;

    $infoFile="${basePath}json/quiz.json";
    $info=json_decode(file_get_contents($infoFile));
    $info->duration=trim($c);
    file_put_contents($infoFile,json_encode($info));

    }
    if (!file_exists($png)) {
      $png="api/thumbnailer/data/missing.png";
    }
    
    print "../users/${path}/thumbnail.png";
}

?>
