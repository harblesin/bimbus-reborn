import { getIO } from "../socketHandler";
const bot = require("../../bot/bot");
const ytdl = require('@distube/ytdl-core');
const db = require('../Config/dbConfig.ts');
const { fetchSongs } = require("../../bot/utils");

const play = (req: any, res: any) => {
    bot.webPlaySong();
    res.end()
}

const getLinks = async (req: any, res: any) => {
    let nowPlayingIndex = bot.getNowPlaying();
    const songs = await fetchSongs();
    res.json({ songList: songs, id: songs[nowPlayingIndex].id })
}

const playYoutube = async (req: any, res: any) => {
    let song = await bot.webPlay(req.body.id);
    res.json(song);
}

const deleteYoutube = async (req: any, res: any) => {
    const { id, oldList } = req.body;
    try {
        await db.query(`DELETE FROM links WHERE id = $1`, [id]);
        const songs = await fetchSongs();
        bot.updateNowPlayingIndex(oldList, songs);
        getIO().emit('songRemoved', { message: 'Song Removed.', updatedList: songs });
        res.json({ message: 'Link Removed', newList: songs });
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

const pauseYoutube = (req: any, res: any) => {
    bot.webPause();
    res.end();
}

const resumeYoutube = (req: any, res: any) => {
    res.json(bot.webResume());
}

const addYoutubeLink = async (req: any, res: any) => {

    let { link } = req.body;
    let weGood = ytdl.validateURL(link);

    if (!weGood) {
        return res.status(500).json('no');
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
        res.status(500).json(err);
    }
}

const playPrevYoutube = (req: any, res: any) => {
    res.json(bot.prevSong());
}

const playNextYoutube = (req: any, res: any) => {
    res.json(bot.nextSong());
}

const volumeDown = (req: any, res: any) => {
    bot.volumeDown();
    res.json({ message: "Volume lowered." });
}

const volumeUp = (req: any, res: any) => {
    bot.volumeUp();
    res.json({ message: "Volume increased." });
}

const stopYoutube = (req: any, res: any) => {
    bot.youtubeStop();
    res.end();
}

const shuffleYoutube = async (req: any, res: any) => {
    res.json(await bot.shuffleYoutube())
}

const updateOrder = async (req: any, res: any) => {
    const { list, oldList } = req.body;
    let caseString = '';
    list.forEach((l: any, i: any) => { caseString = caseString + ` WHEN id = ${l.id} THEN ${i + 1} ` });

    const sqlString = `
        UPDATE links
        SET position = CASE
                            ${caseString}
                        END
        WHERE id IN (${list.map((l: any) => l.id).join(', ')})
    `;

    await db.query(sqlString);
    const songs = await fetchSongs();
    bot.updateNowPlayingIndex(oldList, songs);
    getIO().emit('orderUpdate', { message: 'Song order updated.', updatedList: songs });
    res.json(songs);
}

const botController = {
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
};

export default botController;
