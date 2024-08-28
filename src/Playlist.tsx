import React, { useEffect, useState } from 'react';
import styles from "./Styles/Playlist.module.css";
import InputContainer from "./Components/InputContainer";
import axios from 'axios';
import { SongList } from './Components/SongList';
import { AiOutlineCloseSquare } from "react-icons/ai";
import { LuSpeaker } from "react-icons/lu";
import socket from './Socket/socket';

export default function Playlist() {

    const [songList, setSongList] = useState([]);
    const [nowPlayingId, setNowPlayingId] = useState(null);

    const playSong = (id) => {
        axios.post('/api/bot/play/', { id: id });
    }

    const removeSong = (id) => {
        axios.post('/api/bot/delete', { id: id, oldList: songList }).then((result) => {
            setSongList(result.data.newList);
        });
    }

    const updateOrder = (list) => {
        axios.post('/api/bot/order', { oldList: songList, list: list });
        setSongList(list);
    }

    useEffect(() => {

        axios.get('/api/bot/links').then(result => {
            setSongList(result.data.songList);
            setNowPlayingId(result.data.id);
        });

        socket.on('songAdded', (payload) => {
            console.log(payload.message);
            setSongList(payload.updatedList);
        });

        socket.on('songRemoved', (payload) => {
            console.log(payload.message);
            setSongList(payload.updatedList);
        });
        socket.on('nowPlayingUpdate', (payload) => {
            console.log(payload.message);
            setNowPlayingId(payload.id);
        });

        socket.on('orderUpdate', (payload) => {
            console.log(payload.message);
            setSongList(payload.updatedList);
        });

    }, []);

    return (
        <div className={styles.background} >
            <h1 className={styles.header}>
                Bimbus
            </h1>
            <SongList
                items={songList}
                onChange={updateOrder}
                renderItem={(item) => (
                    <SongList.Item id={item.id}>
                        <SongList.DragHandle />
                        <span className={styles.songTitle} onClick={() => playSong(item.id)}>{item.title}</span>
                        <span className={styles.toolTipContainer}>
                            {item.id === nowPlayingId ? (<><span className={styles.tooltip}>Now Playing</span><LuSpeaker className={styles.speakerIcon} /></>) : null}
                        </span>
                        <AiOutlineCloseSquare onClick={() => removeSong(item.id)} className={styles.closeIcon} />
                    </SongList.Item>
                )}
            />
            <InputContainer />
        </div>
    );

}
