var lc = Array(1);
var albumurl;
var albumid;
var ClientID = "e5bc42d97879571";
var imageSize = {
  width: 652,
  height: 921,
};
var imageBounds = {
  x: 0,
  y: 0,
  width: imageSize.width,
  height: imageSize.height,
};
var input_name;
$(document).ready(function () {
  var localStorageKey = Array(1);
  var bkimg = Array(1);
  var mydrawing = Array(1);
  bkimg[0] = new Image();
  bkimg[0].crossOrigin = "Anonymous";
  bkimg[0].src = "https://masaki.page/web/uchineko/images/paint.png"; //かえる
  localStorageKey[0] = "cat3_1"; //かえる
  mydrawing[0] = "my-drawing1";
  LC.localize("ja-JP");
  for (var i = 0; i < 1; i++) {
    lc[i] = LC.init(document.getElementsByClassName(mydrawing[i])[0], {
      imageURLPrefix: "https://masaki.page/web/static/img",
      imageSize: imageSize,
      primaryColor: "#DBA",
      backgroundColor: "#fff",
      watermarkImage: bkimg[i],
      keyboardShortcuts: false,
      tools: [
        LC.tools.Pencil,
        LC.tools.Eraser,
        LC.tools.Line,
        LC.tools.Rectangle,
        LC.tools.Ellipse,
        LC.tools.Text,
        LC.tools.Polygon,
      ],
      toolbarPosition: "bottom",
      watermarkScale: 0.4,
    });
  }
  $(".controls.export [data-action=export-as-png1]").click(function (e) {
    e.preventDefault();
    var dataURI = lc[0]
      .getImage({
        rect: imageBounds,
      })
      .toDataURL();
    var image = document.getElementById("output1");
    image.src = dataURI;
    delete dataURI;
    delete image;
  });
  if (localStorage.getItem(localStorageKey[0])) {
    lc[0].loadSnapshot(JSON.parse(localStorage.getItem(localStorageKey[0])));
  }
  lc[0].on("drawingChange", function () {
    localStorage.setItem(
      localStorageKey[0],
      JSON.stringify(lc[0].getSnapshot())
    );
  });
  $("[data-action=upload-to-imgur]").click(function (e) {
    e.preventDefault();
    if (document.getElementById("nekonamae").value == ``) {
      alert(`猫の名前をつけてください`);
    } else {
      imgur();
    }
  });
});
/*
          https://imgur.com/a/ipwSPm8
          */
function imgur() {
  input_name = document.getElementById("nekonamae").value;
  checkimgur();
  createalbum();
  sendimage(1);
}

function checkimgur() {
  $.ajax({
    url: "https://api.imgur.com/3/credits",
    type: "GET",
    headers: {
      // Your application gets an imgurClientId from Imgur
      Authorization: "Client-ID " + ClientID,
      Accept: "application/json",
    },
    data: {
      // convert the image data to base64
    },
    success: function (result) {
      console.log(result);
    },
  });
}

function sendimage(num) {
  if (num <= 2) {
    var str = num + "枚目の画像を送信中。少し待ってください。";
    $(".imgur-submit").html(str);
    dataURIImgur = lc[num - 1]
      .getImage({
        rect: imageBounds,
      })
      .toDataURL();
    $.when(
      $.ajax({
        url: "https://api.imgur.com/3/image",
        type: "POST",
        headers: {
          // Your application gets an imgurClientId from Imgur
          Authorization: "Client-ID " + ClientID,
          Accept: "application/json",
        },
        data: {
          // convert the image data to base64
          image: dataURIImgur.split(",")[1],
          type: "base64",
          album: albumid,
          title: input_name + " (" + num + "枚目)",
        },
        success: function (result) {},
      })
    )
      .done(function (result) {
        //                  console.log(result);
        delete dataURIImgur;
        sendimage(num + 1);
      })
      .fail(function () {
        delete dataURIImgur;
        $(".imgur-submit").html(
          "画像保存の上限数を超えた可能性があります。今月はもう保存できないかもしれません。"
        );
        // エラーがあった時
        //                  console.log('error');
      });
  } else {
    $(".imgur-submit").html(
      "送信が終わりました。下のリンクからアクセスしてください。<br/><a href='" +
        albumurl +
        "'>" +
        albumurl +
        "</a>"
    );
  }
}

function createalbum() {
  $.ajax({
    url: "https://api.imgur.com/3/album",
    type: "POST",
    async: false,
    headers: {
      // Your application gets an imgurClientId from Imgur
      Authorization: "Client-ID " + ClientID,
      Accept: "application/json",
    },
    data: {
      // convert the image data to base64
      title: input_name + " (うちねこくらふと)",
      privacy: "hidden",
      layout: "grid",
    },
    success: function (result) {
      albumid = result.data.deletehash;
      //                  console.log(result);
    },
  });
}
