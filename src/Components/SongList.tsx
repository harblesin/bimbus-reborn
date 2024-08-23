import React, { useEffect, useState } from 'react';
import styles from '../Styles/SongList.module.css';
import axios from 'axios';

const SongList = () => {

    const [songList, setSongList] = useState([]);

    const playSong = (i) => {
        axios.post('/api/bot/play', { index: i });
    }

    useEffect(() => {
        axios.get('/api/bot/links').then(result => {
            setSongList(result.data);
        })
    }, [])

    return (
        <div className={styles.container}>
            <ol>
                {songList && songList.map((song, i) => (
                    <li key={i} onClick={() => playSong(i)}>{song?.title}</li>
                ))}
            </ol>
        </div>
    )
}

export default SongList;