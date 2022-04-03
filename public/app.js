let ioConnection = new io();

let viewerCount = 0;
let likeCount = 0;
let diamondsCount = 0;

var widthkanan = 50;
var widthkiri = 50;
var totalKanan = 0;
var totalKiri = 0;
var percentKiri = 0;
var percentKanan = 0;
let kananImg = "https://i.ytimg.com/vi/C1a01e3GWv4/mqdefault.jpg";
let kiriImg = "https://i.pinimg.com/564x/c3/0a/29/c30a297995070d6e3eb78ef88445d389.jpg";
var scoreKanan = 0 ;
var scoreKiri = 0;
$(document).ready(() => {
    $('#connectButton').click(connect);
    $('#uniqueIdInput').on('keyup', function (e) {
        if (e.key === 'Enter') {
            connect();
        }
    });
})

function connect() {
    let uniqueId = $('#uniqueIdInput').val();
    if (uniqueId !== '') {
        ioConnection.emit('setUniqueId', uniqueId, {
            enableExtendedGiftInfo: true
        });
        $('#stateText').text('Connecting...');
    } else {
        alert('no username entered');
    }
}

function sanitize(text) {
    return text.replace(/</g, '&lt;')
}

function updateRoomStats() {
    $('#roomStats').html(`Viewers: <b>${viewerCount.toLocaleString()}</b> Likes: <b>${likeCount.toLocaleString()}</b> Earned Diamonds: <b>${diamondsCount.toLocaleString()}</b>`)
}

function generateUsernameLink(data) {
    return `<a class="usernamelink" href="https://www.tiktok.com/@${data.uniqueId}" target="_blank">${data.uniqueId}</a>`;
}

function isPendingStreak(data) {
    return data.gift.gift_type === 1 && data.gift.repeat_end === 0;
}

function addChatItem(color, data, text, summarize) {
    let container = $('.chatcontainer');

    if (container.find('div').length > 500) {
        container.find('div').slice(0, 200).remove();
    }

    container.find('.temporary').remove();;

    container.append(`
        <div class=${summarize ? 'temporary' : 'static'}>
            <img class="miniprofilepicture" src="${data.profilePictureUrl}">
            <span>
                <b>${generateUsernameLink(data)}:</b> 
                <span style="color:${color}">${sanitize(text)}</span>
            </span>
        </div>
    `);


    container.stop();
    container.animate({
        scrollTop: container[0].scrollHeight
    }, 400);

    if (text.includes("join")) {
        totalKiri += 1;
    } else if (text.includes("like")) {
        totalKanan += 1;
    }
    if (totalKanan > 0 || totalKiri > 0) {
        let totalVote = totalKiri + totalKanan;
        percentKiri = (totalKiri / totalVote) * 100;
        percentKanan = (totalKanan / totalVote) * 100;
        
        $("#pihakkiri").attr('width', percentKiri + "%");
        $("#pihakkanan").attr('width', percentKanan + "%");
    }
    $('#totalVoteKiri').html(totalKiri);
    $('#totalVoteKanan').html(totalKanan);
}
function startTimer() {
    // if (percentKiri == 0 || percentKanan == 0) {
    //     $('#exampleModal').modal('show');
    //     $("#imgModal").attr("src","second.jpg");
    //     resetCounter();
    //     return
    // }
    var secondTimer = 120;
    var currentSecond = secondTimer;
    var x = setInterval(function() {
        currentSecond = currentSecond - 1;
        document.getElementById("timerText").innerHTML = "WAKTU TERSISA : " + fancyTimeFormat(currentSecond)
        // console.log("percent kanan " + percentKanan);
        // console.log("percent kiri " + percentKiri);
        if (currentSecond <= 0) {
            
            console.log("percent kanan 0 " + percentKanan);
            console.log("percent kiri 0 " + percentKiri);
            if (percentKiri > percentKanan) {
                scoreKiri += 1;
                console.log("kiri Menang");
                var mymodal = $('#exampleModal');
                mymodal.find('.modal-body').html('<img src="'+ kiriImg+ '" height="400" width="400">');

            } else if (percentKiri < percentKanan){
                scoreKanan += 1;
                var mymodal = $('#exampleModal');
                mymodal.find('.modal-body').html('<img src="'+ kananImg+ '" height="400" width="400"></img>');
            } else {
                var mymodal = $('#exampleModal');
                mymodal.find('.modal-body').html('SERI');
            }
            $('#exampleModal').modal('show');
            currentSecond = secondTimer;
            resetCounter();
            $('#score').html('SCORE ' + scoreKiri +': ' + scoreKanan);
        }
    }, 1000)
}

function fancyTimeFormat(duration)
{   
    // Hours, minutes and seconds
    var hrs = ~~(duration / 3600);
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

function resetCounter() {
    totalKiri = 0;
    totalKanan = 0;
    $("#pihakkiri").attr('width', "50" + "%");
    $("#pihakkanan").attr('width', "50" + "%");
    hideModal();
}

function hideModal() {
    var delayInMilliseconds = 3000; //1 second

    setTimeout(function () {
        $('#exampleModal').modal('hide');
    }, delayInMilliseconds);
}

function addGiftItem(data) {
    let container = $('.giftcontainer');

    if (container.find('div').length > 200) {
        container.find('div').slice(0, 100).remove();
    }

    let streakId = data.userId.toString() + '_' + data.giftId;

    let html = `
        <div data-streakid=${isPendingStreak(data) ? streakId : ''}>
            <img class="giftprofilepicture" src="${data.profilePictureUrl}">
            <span>
                Terimakasih <b>${generateUsernameLink(data)}</b> Untuk <img class="gifticon" src="${(data.extendedGiftInfo.icon || data.extendedGiftInfo.image).url_list[0]}"> Nya :D 
                <div>
                    <table>
                        <tr>
                            <td><img class="gifticon" src="${(data.extendedGiftInfo.icon || data.extendedGiftInfo.image).url_list[0]}"></td>
                            <td>
                                <span>Name: <b>${data.extendedGiftInfo.name}</b> (ID:${data.giftId})<span><br>
                                <span>Repeat: <b style="${isPendingStreak(data) ? 'color:red' : ''}">x${data.gift.repeat_count.toLocaleString()}</b><span><br>
                                <span>Cost: <b>${(data.extendedGiftInfo.diamond_count * data.gift.repeat_count).toLocaleString()} Diamonds</b><span>
                            </td>
                        </tr>
                    </tabl>
                </div>
            </span>
        </div>
    `;

    let existingStreakItem = container.find(`[data-streakid='${streakId}']`);

    if (existingStreakItem.length) {
        existingStreakItem.replaceWith(html);
    } else {
        container.append(html);
    }

    container.stop();
    container.animate({
        scrollTop: container[0].scrollHeight
    }, 800);
}

// Control events
ioConnection.on('setUniqueIdSuccess', (state) => {
    // reset stats
    viewerCount = 0;
    likeCount = 0;
    diamondsCount = 0;
    updateRoomStats();
    //$('#stateText').text(`Connected to roomId ${state.roomId}`);
    startTimer();
})

ioConnection.on('setUniqueIdFailed', (errorMessage) => {
    $('#stateText').text(errorMessage);
})

ioConnection.on('streamEnd', () => {
    $('#stateText').text('Stream ended.');
})

// viewer stats
ioConnection.on('roomUser', (msg) => {
    if (typeof msg.viewerCount === 'number') {
        viewerCount = msg.viewerCount;
        updateRoomStats();
    }
})

// like stats
ioConnection.on('like', (msg) => {
    if (typeof msg.likeCount === 'number') {
        addChatItem('#447dd4', msg, msg.label.replace('{0:user}', '').replace('likes', `${msg.likeCount} likes`))
    }

    if (typeof msg.totalLikeCount === 'number') {
        likeCount = msg.totalLikeCount;
        updateRoomStats();
    }
})

// Chat events,
let joinMsgDelay = 0;
ioConnection.on('member', (msg) => {
    let addDelay = 250;
    if (joinMsgDelay > 500) addDelay = 100;
    if (joinMsgDelay > 1000) addDelay = 0;

    joinMsgDelay += addDelay;

    setTimeout(() => {
        joinMsgDelay -= addDelay;
        addChatItem('#21b2c2', msg, 'joined', true);
    }, joinMsgDelay);
})

ioConnection.on('chat', (msg) => {
    addChatItem('', msg, msg.comment);
})

ioConnection.on('gift', (data) => {
    addGiftItem(data);

    if (!isPendingStreak(data) && data.extendedGiftInfo.diamond_count > 0) {
        diamondsCount += (data.extendedGiftInfo.diamond_count * data.gift.repeat_count);
        updateRoomStats();
    }
})

// share, follow
ioConnection.on('social', (data) => {
    let color = data.displayType.includes('follow') ? '#ff005e' : '#2fb816';
    addChatItem(color, data, data.label.replace('{0:user}', ''));
})