const socket = io('http://localhost:3000'); //tao socket server voi port: 3000
$('.div-content').hide();
//thong bao dang ky that bai
socket.on('DANG_KY_THAT_BAI', function () {
    alert('Chon username khac');
});
socket.on('ROOM_FULL', function () {
   alert('Room full! Get out.');
});
socket.on('BOSS', function () {
   $('.check-box').hide();
   $('.text').text('Da co Boss!');
});
// lang nghe server va gui lai danh sach nguoi online
socket.on('ONLINE', function (arrUserInfo, u) {
    $('.div-content').show();
    $('.div-sign-up').hide();
   arrUserInfo.forEach(function (user) {
       const {name, peerId, permiss} = user;
       if(u.name != user.name){
           if(permiss == 1) {
               $("#ulUser").append(`<li id="${peerId}" class="mat-to"><span class="fa fa-user-circle"></span> ${name}</li>`);
           } else {
                   $("#ulUser").append(`<li id="${peerId}"><span class="fa fa-user-circle"></span> ${name}</li>`);
           }
       }
   });
    //hien thi nguoi dung moi
    socket.on('NGUOI_DUNG_MOI', function (user) {
        const {name, peerId, permiss} = user;
        if(permiss == 1) {
            $("#ulUser").append(`<li id="${peerId}"> <span class="fa fa-user-circle"></span> ${name}</li>`);

        } else {
            $("#ulUser").append(`<li id="${peerId}"> <span class="fa fa-user-circle"></span> ${name}</li>`);
        }
    });
    //hien thi camera cua dai ca
    socket.on('CAMERA_USER_CALLING', function (userCurrent) {
        var remote1, btn;
        async.eachSeries(userCurrent, function (user, callback) {
            switch (user.pos) {
                case 0:
                    remote1 = "masterStream";
                    btn = "masterBtn";
                    break;
                case 1:
                    remote1 = "remoteStream1";
                    btn = "remoteBtn1";
                    break;
                case 2:
                    remote1 = "remoteStream2";
                    btn = "remoteBtn2";
                    break;
                case 3:
                    remote1 = "remoteStream3";
                    btn = "remoteBtn3";
                    break;
                case 4:
                    remote1 = "remoteStream4";
                    btn = "remoteBtn4";
                    break;
            }
            console.log('calling: ' + remote1 + "  " + user.peerId);
            if(user.peerId == currentId) {
                openStream().then(function (stream) {
                    playStream(remote1, stream);
                    if (currentId == idMaster) {
                        $("." + btn).addClass("act");
                        $("." + btn).attr("id", user.peerId);
                    }
                    callback();
                });
            } else {
                openStream().then(function (stream) {
                    const callMaster = peer.call(user.peerId, stream);
                    callMaster.on('stream', function (remoteStream) {
                        playStream(remote1, remoteStream);
                        if (currentId == idMaster) {
                            $("." + btn).addClass("act");
                            $("." + btn).attr("id", user.peerId);
                        }
                        callback();
                    });
                });
            }
        });
    });
    socket.on('SHOW_CAMERA_BOSS_ON_SLAVE', function (userCurrent) {
        var remote1, btn;
        async.eachSeries(userCurrent, function (user, callback) {
            switch (user.pos) {
                case 0:
                    remote1 = "masterStream";
                    btn = "masterBtn";
                    break;
                case 1:
                    remote1 = "remoteStream1";
                    btn = "remoteBtn1";
                    break;
                case 2:
                    remote1 = "remoteStream2";
                    btn = "remoteBtn2";
                    break;
                case 3:
                    remote1 = "remoteStream3";
                    btn = "remoteBtn3";
                    break;
                case 4:
                    remote1 = "remoteStream4";
                    btn = "remoteBtn4";
                    break;
            }
            console.log('calling: ' + remote1 + "  " + user.peerId);
            if(user.peerId == currentId) {
                openStream().then(function (stream) {
                    playStream(remote1, stream);
                    if (currentId == idMaster) {
                        $("." + btn).addClass("act");
                        $("." + btn).attr("id", user.peerId);
                    }
                    callback();
                });
            } else {
                openStream().then(function (stream) {
                    const callMaster = peer.call(user.peerId, stream);
                    callMaster.on('stream', function (remoteStream) {
                        playStream(remote1, remoteStream);
                        if (currentId == idMaster) {
                            $("." + btn).addClass("act");
                            $("." + btn).attr("id", user.peerId);
                        }
                        callback();
                    });
                });
            }
        });
    });
    socket.on('HOI_BOSS', function (Id) {
        if(currentId == Id.id_master) {
            var mess = confirm(Id.name + " calling!");
            if(mess == true) {
                console.log('ok');
                socket.emit('DONG_Y_GOI', Id.id_slave);
                console.log(mess);
            }
        }
    });
    socket.on('OK_GOI', function (param) {
        console.log('remote_slave_master: ' + param.remote_slave);
        var remote, btn;
        switch (param.remote_slave) {
            case 1:
                remote = "remoteStream1";
                btn = "remoteBtn1";
                break;
            case 2:
                remote = "remoteStream2";
                btn = "remoteBtn2";
                break;
            case 3:
                remote = "remoteStream3";
                btn = "remoteBtn3";
                break;
            case 4:
                remote = "remoteStream4";
                btn = "remoteBtn4";
                break;
        }
        console.log(remote + ": " + param.id_slave);
        var idSlave = param.id_slave;
        console.log("curr : " + currentId + idMaster);
        if(currentId != idSlave) {
            openStream().then(function (stream) {
                const callSlave = peer.call(idSlave, stream);
                callSlave.on('stream', function (remoteStream) {
                    playStream(remote, remoteStream);
                    if (currentId == idMaster) {
                        $("." + btn).addClass("act");
                        $("." + btn).attr("id", idSlave);
                    }
                });
            });
        } else {
            openStream().then(function (stream) {
                playStream(remote, stream);
                if (currentId == idMaster) {
                    $("." + btn).addClass("act");
                    $("." + btn).attr("id", idSlave);
                }
            });
        }
    });
    socket.on('CAMERA_SLAVE_ON_SLAVE_OTHER', function (param) {
        console.log('remote_slave: ' + param.remote_slave);
        var remote, btn;
        switch (param.remote_slave) {
            case 1:
                remote = "remoteStream1";
                btn = "remoteBtn1";
                break;
            case 2:
                remote = "remoteStream2";
                btn = "remoteBtn2";
                break;
            case 3:
                remote = "remoteStream3";
                btn = "remoteBtn3";
                break;
            case 4:
                remote = "remoteStream4";
                btn = "remoteBtn4";
                break;
        }
        var idSlave = param.id_slave;
        if(currentId != idSlave) {
            openStream().then(function (stream) {
                const callSlave = peer.call(idSlave, stream);
                callSlave.on('stream', function (remoteStream) {
                    playStream(remote, remoteStream);
                    if (currentId == idMaster) {
                        $("." + btn).addClass("act");
                        $("." + btn).attr("id", idSlave);
                    }
                });
            });
        } else {
            openStream().then(function (stream) {
                playStream(remote, stream);
                if (currentId == idMaster) {
                    $("." + btn).addClass("act");
                    $("." + btn).attr("id", idSlave);
                }
            });
        }
    });
    socket.on("MESSAGE_SLAVE", function (id_slave) {
        if(currentId == id_slave) {
            // $(`#${id_slave}`).remove();
            $(".mat-to").addClass("disabled");
            $(".masterBtn").addClass("disabled");
            peer.destroy();
            alert("Master blocked you! Sign up again to call master!")
        }
    });
    //su kien ngat ket noi
    socket.on('NGAT_KET_NOI', function (peerId) {
        $(`#${peerId}`).remove();
    })

});
function  openStream() {
    const config = {audio:false,  video:true}; // su dung video, khong su dung audio
    return navigator.mediaDevices.getUserMedia(config)
}
// chay camera
function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;  //gan video vao stream object
    video.play();
}
var peer = new Peer({key: 'kxv47043me6lmcxr'}); // su dung thu vien peerjs de tao peer nguoi dung
var currentId, idMaster;
peer.on('open', function (id) {
    $('#my-peer').append(id); //show peer ra man hinh
    //sign up
    $("#btnSignUp").click(function () {
        const username = $("#txtUsername").val();
        currentId = id;
        var bool = $(".master").is(":checked");
        if(bool === true) {
            idMaster = id;
            socket.emit('DANG_KY', {name: username, peerId: id, permiss: 1});
        } else {
            socket.emit('DANG_KY', {name: username, peerId: id, permiss: 0});
        }
    });
});

//caller
 $("#btnCall").click(function () { // bat su kien call
     const id = $('#remoteId').val(); //lay ra peer cua nguoi can goi
     console.log(id);
     openStream().then(function (stream) {// hien stream cua local (nguoi goi)
         playStream('masterStream', stream);
         const call = peer.call(id, stream); // bat dau goi
         call.on('stream', function (remoteStream) {
             playStream('remoteStream', remoteStream)
         });
     })
 });
 
 //receive

peer.on('call', function (call) {
    openStream().then(function (stream) {
        call.answer(stream); // tra loi cuoc goi

    })
});

//click vao danh sach de goi
$("#ulUser").on('click', '.mat-to', function () {
    const id = $(this).attr('id'); // lay ra id cua nguoi dung trong li tag
    socket.emit('DANG_KY_GOI_BOSS', currentId);
});
//Boss huy cuoc goi voi cac slave
$(".btn-danger").on('click', function () {
    if(currentId == idMaster) {
        var id = $(this).attr("id");
        console.log("findi: " + id);
        socket.emit("KET_THUC_CUOC_GOI", id);
    }
});
$(".masterBtn").on("click", function () {
   if(currentId != idMaster) {
       socket.emit('DANG_KY_GOI_BOSS', currentId);
   }
});