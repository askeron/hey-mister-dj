var eventName = "Test5"

if (window.localStorage.getItem("eventName") !== eventName) {
    window.localStorage.clear();
}
window.localStorage.setItem("eventName", eventName);

var adminPassword = null

if (window.location.hash && window.location.hash.startsWith("#adminPassword=")) {
    adminPassword = window.location.hash.replace("#adminPassword=","");
}

var vm = new Vue ({
    el: "#app",
    data: {
        songName: "",
        sortOrderAlphabetical: false,
        userId: window.localStorage.getItem("userId"),
        userSecret: window.localStorage.getItem("userSecret"),
        adminPassword: adminPassword,
        songs:
        [   
        ]
    },
    created: function() {
        if (this.userId == null || this.userSecret == null) {
            this.createUser();
        } else {
            axios.get('/isUserExists?userId='+this.userId)
                .then(function (response) {
                    if (!response.data) {
                        vm.createUser()
                    }
                })
                .catch(function (error) {
                    console.log('Error while isUserExists ' + error);
                });
        }
        this.reloadSongs();
    },
    methods: {
        rotateSort: function() {
            this.sortOrderAlphabetical = !(this.sortOrderAlphabetical)
        },
        addSong: function() {
            axios.get('/createSong?userId='+this.userId+'&userSecret='+this.userSecret+'&name='+encodeURI(this.songName))
                .then(function (response) {
                    vm.songName = "";
                    vm.songs = response.data;
                })
                .catch(function (error) {
                    console.log('Error while addSong ' + error);
                });
        },
        deleteSong: function(song) {
            axios.get('/deleteSong?adminPassword='+this.adminPassword+'&songId='+song.id)
                .then(function (response) {
                    vm.songs = response.data;
                })
                .catch(function (error) {
                    console.log('Error while deleteSong ' + error);
                });
        },
        voteSong: function(song) {
            axios.get('/voteSong?userId='+this.userId+'&userSecret='+this.userSecret+'&songId='+song.id+'&voteValue='+(!song.votes.includes(this.userId)))
                .then(function (response) {
                    vm.songs = response.data;
                })
                .catch(function (error) {
                    console.log('Error while voteSong ' + error);
                });
        },
        createUser: function() {
            axios.get('/createUser')
                .then(function (response) {
                    vm.userId = response.data.id;
                    vm.userSecret = response.data.secret;
                    window.localStorage.setItem("userId", vm.userId);
                    window.localStorage.setItem("userSecret", vm.userSecret);
                })
                .catch(function (error) {
                    console.log('Error while create user ' + error);
                });
        },
        reloadSongs: function() {
            axios.get('/getSongs')
                .then(function (response) {
                    vm.songs = response.data;
                })
                .catch(function (error) {
                    console.log('Error while reloadSongs ' + error);
                });
        },
        isVotedByMe: function(song) {
            return song.votes.includes(this.userId);
        }
    },
    computed:{
        sortedSongs:function() {
            if (this.sortOrderAlphabetical) {
                return this.songs.sort((a,b) => {
                    if (a.name.localeCompare(b.name) != 0) return a.name.localeCompare(b.name);
                    if (a.votes.length > b.votes.length) return -1;
                    if (a.votes.length < b.votes.length) return 1;
                    return 0;
                });
            } else {
                return this.songs.sort((a,b) => {
                    if (a.votes.length > b.votes.length) return -1;
                    if (a.votes.length < b.votes.length) return 1;
                    return a.name.localeCompare(b.name);
                });
            }
        }
      }
});

var socket = io();
socket.on('connect', function(data) {
    socket.emit('join', 'Hello World from userId: '+vm.userId);
});
socket.on('reloadSongs', function(data){
    if (JSON.parse(data).userIdThatCreatedChange != vm.userId) {
        vm.reloadSongs();
    }
});