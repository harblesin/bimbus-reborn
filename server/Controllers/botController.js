const bot = require("../../bot/bot");
const ytdl = require('@distube/ytdl-core');
const { getIO } = require("../socketHandler");
const db = require('../Config/dbConfig.ts');
const { fetchSongs } = require("../../bot/utils.js");

const play = (req, res) => {
    bot.webPlaySong();
    res.end()
}

const getLinks = async (req, res) => {
    let nowPlayingIndex = bot.getNowPlaying();
    const songs = await fetchSongs();
    res.json({ songList: songs, id: songs[nowPlayingIndex].id })
}

const playYoutube = async (req, res) => {
    let song = await bot.webPlay(req.body.id);
    res.json(song);
}

const deleteYoutube = async (req, res) => {
    const { id } = req.body;
    try {
        await db.query(`DELETE FROM links WHERE id = $1`, [id]);
        const songs = await fetchSongs();
        getIO().emit('songRemoved', { message: 'Song Removed.', updatedList: songs });
        res.json({ message: 'Link Removed', newList: songs });
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

const addYoutubeLink = async (req, res) => {

    let { link } = req.body;
    let weGood = ytdl.validateURL(link);

    if (!weGood) {
        return reject('no');
    }

    try {
        let linkInfo = await ytdl.getInfo(link);
        let sqlString = `
                    INSERT INTO links (title, link, image, position) 
                    VALUES (
                        $1, 
                        $2, 
                        $3, 
                        CASE 
                            WHEN (SELECT COUNT(*) FROM links) = 0 THEN 1 
                            ELSE (SELECT COALESCE(MAX(position), 0) + 1 FROM links) 
                        END
                    );`;
        let values = [linkInfo.player_response.videoDetails.title, link, linkInfo.player_response.videoDetails.thumbnail.thumbnails[0].url];
        await db.query(sqlString, values);
        const songs = await fetchSongs();
        getIO().emit('songAdded', { message: 'Song Added.', updatedList: songs });
        res.json(songs);
    } catch (err) {
        console.log(' we are the erro', err)
        reject(err);
    }
}

const playPrevYoutube = (req, res) => {
    res.json(bot.prevSong());
}

const playNextYoutube = (req, res) => {
    res.json(bot.nextSong());
}

const volumeDown = (req, res) => {
    bot.volumeDown();
    res.json({ message: "Volume lowered."});
}

const volumeUp = (req, res) => {
    bot.volumeUp();
    res.json({ message: "Volume increased."});
}

const stopYoutube = (req, res) => {
    bot.youtubeStop();
    res.end();
}

const shuffleYoutube = async (req, res) => {
    res.json(await bot.shuffleYoutube())
}

const updateOrder = async (req, res) => {
    const { list } = req.body;
    let caseString = '';
    list.forEach((l, i) => { caseString = caseString + ` WHEN id = ${l.id} THEN ${i + 1} ` });

    const sqlString = `
        UPDATE links
        SET position = CASE
                            ${caseString}
                        END
        WHERE id IN (${list.map(l => l.id).join(', ')})
    `;

    await db.query(sqlString);
    const songs = await fetchSongs();
    getIO().emit('orderUpdate', { message: 'Song order updated.', updatedList: songs });
    res.json(songs);
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