const bot = require("../../bot/bot");
const path = require('path');
const fs = require('fs');
let youtubeLinks = require('../links.json');
const ytdl = require('@distube/ytdl-core');
const { getIO } = require("../socketHandler");


const play = (req, res) => {
    bot.webPlaySong();
    res.end()
}

const getLinks = (req, res) => {
    res.json(youtubeLinks)
}

const playYoutube = async (req, res) => {
    let song = await bot.webPlay(req.body.id);
    res.json(song);
}

const deleteYoutube = async (req, res) => {
    const { id } = req.body;
    try {
        youtubeLinks = youtubeLinks.filter(link => link.id !== id);
        fs.writeFile(path.join(__dirname + `../links.json`), JSON.stringify(youtubeLinks), err => {
            if (err) {
                return err
            } else {
                return 'Link Removed.'
            }
        });
        // const io = require("../server");
        getIO().emit('songRemoved', { message: 'Song Removed.', updatedList: youtubeLinks });
        res.json({ message: 'Link Removed', newList: youtubeLinks });
    } catch (err) {
        res.status(500).json({ error: err })
    }

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
                id: youtubeLinks.length + 1,
                title: linkInfo.player_response.videoDetails.title,
                link: link,
                image: linkInfo.player_response.videoDetails.thumbnail.thumbnails[0].url
            });

            let pathName = path.join(__dirname, `../links.json`);

            fs.writeFile(pathName, JSON.stringify(youtubeLinks), (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(youtubeLinks);
                }
            });
        })
    }

    let { link } = req.body;
    writeFile(link)
        .then(async result => {
            // const io = require("../server");
            getIO().emit('songAdded', { message: 'Song Added.', updatedList: result });
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

const updateOrder = (req, res) => {
    const { list } = req.body;
    let pathName = path.join(__dirname, `../links.json`);

    const updateLinks = async (list) => {
        return new Promise(async (resolve, reject) => {

            fs.writeFile(pathName, JSON.stringify(list), (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve('File appended.');
                }
            });
        })
    }

    updateLinks(list).then(async result => {
        // const io = require("../server");
        getIO().emit('orderUpdate', { message: 'Song order updated.', updatedList: list });
        res.json(result);
    })
        .catch(err => {
            res.json(err);
        });
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
    shuffleYoutube,
    updateOrder
}