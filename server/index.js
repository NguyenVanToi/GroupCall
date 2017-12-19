/**
 * Created by toinv-php on 28/10/2017.
 */
const io = require('socket.io')(3000);
const arrUserInfo = []; //mang user
const userCurrent = []; //danh sach nhung nguoi dang ket noi
var i = 0;
var index_del;
io.on('connection', function (socket) {
   // Kiem tra master
   const isExistMaster = arrUserInfo.some(e =>  e.permiss == 1);
   if(isExistMaster) {
       socket.emit('BOSS');
   }
   // Dang ky
   socket.on('DANG_KY', function (user) {
       //kiem tra user da ton tai hay chua
        const isExist = arrUserInfo.some(e =>  e.name === user.name);
        socket.peerId = user.peerId; // gan peerId bang peerId cua user de danh dau
        //neu ton tai: return neu chua ton tai cho push vao mang.
        if(isExist) return socket.emit('DANG_KY_THAT_BAI');
        var j = 1, k = 0;
        if(user.permiss == 1) {
            user.pos = 0;
        } else {
           for (j = 1; j < 5; j ++) {
               if(arrUserInfo.length == 0) {
                    user.pos = 1;
               } else {
                   for (k = 0; k < arrUserInfo.length; k++) {
                       if (j != arrUserInfo[k].pos && arrUserInfo[k].pos != 0) {
                           user.pos = j;
                       }
                       if (arrUserInfo[k].pos == 0 && arrUserInfo.length == 1) {
                           user.pos = 1;
                       }
                   }
               }
           }
        }

       if(arrUserInfo.length < 5) {
            arrUserInfo.push(user);
            socket.emit('ONLINE', arrUserInfo, user); // gui lai danh sach onlien cho client
            socket.broadcast.emit('NGUOI_DUNG_MOI', user); // gui lai nguoi dung moi
            const checkMaster = arrUserInfo.some(e =>  e.permiss == 1); // Kiem tra xem da cho dai ca vao chua
            if(checkMaster) {
                //Neu da co dai ca thi anh em quay thoi
                socket.index = arrUserInfo.findIndex(e => e.permiss == 1);
                const checkCurrent = userCurrent.some(e =>  e.permiss == 1); // kiem tra xem master co trong userCurrent
                if(!checkCurrent) {
                    userCurrent.push(arrUserInfo[socket.index]);
                }
                socket.emit('CAMERA_USER_CALLING', userCurrent); // hien thi camera tren local cua dai ca
                socket.broadcast.emit('SHOW_CAMERA_BOSS_ON_SLAVE', userCurrent); // show camera cua dai ca tren cac slave
            }
        } else {
           socket.emit('ROOM_FULL');
        }
   });
   // Slave goi dai c
   socket.on('DANG_KY_GOI_BOSS', function (id) {
       var im = arrUserInfo.findIndex(e => e.permiss == 1);
       var is = arrUserInfo.findIndex(e => e.peerId == id);
       socket.broadcast.emit('HOI_BOSS', {id_master: arrUserInfo[im].peerId, id_slave: arrUserInfo[is].peerId, name: arrUserInfo[is].name});
   });
    socket.on('DONG_Y_GOI', function (id_slave) {
        // console.log(bool);
        var im = arrUserInfo.findIndex(e => e.permiss == 1);
        var is = arrUserInfo.findIndex(e => e.peerId == id_slave);
        userCurrent.push(arrUserInfo[is]);
        socket.emit('OK_GOI', {id_master: arrUserInfo[im].peerId, id_slave:arrUserInfo[is].peerId, remote_slave: arrUserInfo[is].pos});
        socket.broadcast.emit('CAMERA_SLAVE_ON_SLAVE_OTHER',{id_slave:arrUserInfo[is].peerId, remote_slave: arrUserInfo[is].pos});
    });
    socket.on("KET_THUC_CUOC_GOI", function(id_slave) {
        const index = arrUserInfo.findIndex(user=> user.peerId === id_slave); // tim peerId trong mang user
        arrUserInfo.splice(index, 1);//xoa phan tu khoi mang
        userCurrent.splice(index, 1);//xoa phan tu khoi mang
        socket.broadcast.emit('MESSAGE_SLAVE', id_slave);
        io.emit('NGAT_KET_NOI', id_slave);
    });
   //lang nghe su kien ngat ket noi tu client
   socket.on('disconnect', function () {
       const index = arrUserInfo.findIndex(user=> user.peerId === socket.peerId); // tim peerId trong mang user
       const index1 = userCurrent.findIndex(user=> user.peerId === socket.peerId); // tim peerId trong mang user
       if(index > 0) {
           arrUserInfo.splice(index, 1);//xoa phan tu khoi mang
           userCurrent.splice(index, 1);//xoa phan tu khoi mang
       }
       io.emit('NGAT_KET_NOI', socket.peerId); //truyen su kien ngat ket noi xuong client
   });
});