const bot = require("../../bot/bot");
const path = require('path');

const fs = require('fs');
let youtubeLinks = require('../../public/links.json');
const ytdl = require('@distube/ytdl-core');


const play = (req, res) => {
    bot.webPlaySong();
    res.end()
}

const getLinks = (req, res) => {
    console.log('are we here???')

    // return new Promise((resolve, reject) => {
    //     let links = youtubeLinks;
    //     return resolve(links);
    // })

    res.json(youtubeLinks)

}

const playYoutube = async (req, res) => {
    let song = await bot.webPlay(req.body.index);
    res.json(song);
}

const deleteYoutube = (req, res) => {
    bot.webDeleteYoutubeSong(req.body.index);
    res.end();
}

const pauseYoutube = (req, res) => {
    bot.webPause();
    res.end();
}

const resumeYoutube = (req, res) => {
    res.json(bot.webResume());
}

const addYoutubeLink = (req, res) => {

    const writeFile = async (link) => {

        return new Promise(async (resolve, reject) => {
            let weGood = ytdl.validateURL(link);
    
            if (!weGood) {
                return reject('no');
            }
            let linkInfo = await ytdl.getInfo(link);
    
            youtubeLinks.push({
                title: linkInfo.player_response.videoDetails.title,
                link: link,
                image: linkInfo.player_response.videoDetails.thumbnail.thumbnails[0].url
            });
    
            let pathName = path.join(__dirname, `../../public/links.json`);
    
            fs.writeFile(pathName, JSON.stringify(youtubeLinks), (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve('File appended.');
                }
            })
    
        })
    
    }

    let { link } = req.body;
    writeFile(link)
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            res.json(err);
        });
}

const playPrevYoutube = (req, res) => {
    res.json(bot.webPrev());
}

const playNextYoutube = (req, res) => {
    res.json(bot.nextSong());
}

const volumeDown = (req, res) => {
    bot.volumeDown();
    res.json({});
}

const volumeUp = (req, res) => {
    bot.volumeUp();
    res.json({});
}

const stopYoutube = (req, res) => {
    bot.youtubeStop();
    res.end();
}

const shuffleYoutube = async (req, res) => {
    res.json(await bot.shuffleYoutube())
}

module.exports = {
    play,
    getLinks,
    playYoutube,
    deleteYoutube,
    pauseYoutube,
    resumeYoutube,
    playPrevYoutube,
    playNextYoutube,
    addYoutubeLink,
    volumeDown,
    volumeUp,
    stopYoutube,
    shuffleYoutube
}