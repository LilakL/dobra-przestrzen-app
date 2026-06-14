<!DOCTYPE html>
<html>
<head>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<title><?= appName ?></title>

<script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js"></script>

<style>

body{
  font-family:Arial,sans-serif;
  background:#f5f5f5;
  margin:0;
  padding:15px;
}

.card{
  background:white;
  border-radius:14px;
  padding:15px;
  margin-bottom:15px;
  box-shadow:0 2px 8px rgba(0,0,0,.08);
}

h1{
  margin:0;
}

select,
button{
  width:100%;
  padding:14px;
  font-size:18px;
  margin-top:8px;
  border-radius:10px;
}

.primary{
  background:#0f766e;
  color:white;
  border:none;
}

.success{
  background:#16a34a;
  color:white;
  border:none;
}

.info{
  background:#2563eb;
  color:white;
  border:none;
}

#video{
  width:100%;
  border-radius:12px;
  background:black;
}

#clientBox{
  display:none;
}

.big{
  font-size:24px;
  font-weight:bold;
}

.ok{
  color:green;
  font-size:30px;
}

</style>

</head>

<body>

<div class="card">

<h1><?= appName ?></h1>

<div id="operator">
Operator...
</div>

</div>

<div class="card">

<h3>Zajęcia</h3>

<select id="scheduleSelect">
<option>Ładowanie...</option>
</select>

</div>

<div class="card">

<button
class="primary"
onclick="startCamera()">
URUCHOM KAMERĘ
</button>

<video
id="video"
playsinline>
</video>

<canvas
id="canvas"
style="display:none">
</canvas>

</div>

<div
id="clientBox"
class="card">

<div
id="clientName"
class="big">
</div>

<div
id="clientRemain">
</div>

<select id="packageSelect"></select>

<button
class="success"
onclick="checkin()">
CHECK-IN
</button>

<button
class="info"
onclick="recharge()">
DOŁADUJ
</button>

<div
id="result"
style="margin-top:15px">
</div>

</div>

<script>

const TOKEN = "<?= token ?>";

let currentClientId = "";
let stream = null;

google.script.run
.withSuccessHandler(r=>{

  if(r.ok){
    operator.innerHTML =
      "Operator: <b>"+r.name+"</b>";
  }

})
.apiGetOperator(TOKEN);

google.script.run
.withSuccessHandler(loadSchedule)
.apiGetSchedule();

google.script.run
.withSuccessHandler(loadPackages)
.apiGetPackages();

function loadPackages(list){

  packageSelect.innerHTML="";

  list.forEach(x=>{

    const o=document.createElement("option");
    o.value=x;
    o.textContent="+"+x;

    packageSelect.appendChild(o);

  });

}

function loadSchedule(data){

  scheduleSelect.innerHTML="";

  data.forEach(row=>{

    const o=document.createElement("option");

    o.value=
      row.day+"|"+
      row.hour+"|"+
      row.className;

    o.textContent=
      row.day+
      " | "+
      row.hour+
      " | "+
      row.className;

    scheduleSelect.appendChild(o);

  });

}

async function startCamera() {

  try {

    const videoEl =
      document.getElementById("video");

    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    videoEl.srcObject = stream;

    await videoEl.play();

    alert("Kamera uruchomiona");

    requestAnimationFrame(scanLoop);

  }
  catch(err){

    alert(
      "Błąd kamery: " +
      err.name +
      " | " +
      err.message
    );

    console.error(err);

  }

}

function scanLoop(){

  if(video.readyState===video.HAVE_ENOUGH_DATA){

    canvas.width=video.videoWidth;
    canvas.height=video.videoHeight;

    const ctx =
      canvas.getContext("2d");

    ctx.drawImage(
      video,
      0,
      0
    );

    const img =
      ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

    const code =
      jsQR(
        img.data,
        img.width,
        img.height
      );

    if(code){

      const id =
        String(code.data).trim();

      previewClient(id);

      return;

    }

  }

  requestAnimationFrame(scanLoop);

}

function previewClient(id){

  google.script.run
  .withSuccessHandler(r=>{

    if(!r.ok){

      alert(r.msg);

      requestAnimationFrame(scanLoop);

      return;

    }

    currentClientId=id;

    clientBox.style.display="block";

    clientName.innerHTML=r.name;

    clientRemain.innerHTML=
      "Pozostało wejść: <b>"+
      r.remaining+
      "</b>";

  })
  .apiPreview(
    TOKEN,
    id
  );

}

function checkin(){

  if(!currentClientId){
    return;
  }

  const arr =
    scheduleSelect.value.split("|");

  google.script.run
  .withSuccessHandler(r=>{

    if(r.ok){

      result.innerHTML=
        "<div class='ok'>✔ "+
        r.before+
        " → "+
        r.after+
        "</div>";

      setTimeout(resetScanner,1200);

    }else{

      alert(r.msg);

    }

  })
  .apiCheckin(
    TOKEN,
    currentClientId,
    arr[0],
    arr[1],
    arr[2]
  );

}

function recharge(){

  if(!currentClientId){
    return;
  }

  const qty =
    Number(packageSelect.value);

  google.script.run
  .withSuccessHandler(r=>{

    if(r.ok){

      result.innerHTML=
        "<div class='ok'>✔ "+
        r.before+
        " → "+
        r.after+
        "</div>";

      setTimeout(resetScanner,1200);

    }

  })
  .apiRecharge(
    TOKEN,
    currentClientId,
    qty
  );

}

function resetScanner(){

  currentClientId="";

  result.innerHTML="";

  clientBox.style.display="none";

  requestAnimationFrame(scanLoop);

}

</script>

</body>
</html>