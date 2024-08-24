import React, { useEffect, useState } from 'react';
import styles from "./Styles/Playlist.module.css";
import InputContainer from "./Components/InputContainer.tsx";
import axios from 'axios';
import { SongList } from './Components/SongList.tsx';
import { AiOutlineCloseSquare } from "react-icons/ai";
import socket from './Socket/socket.js';


export default function Playlist() {

    const removeSong = (id) => {
        axios.post('/api/bot/delete', { id: id }).then((result) => {
            setSongList(result.data.newList);
        });
    }

    const updateOrder = (list) => {
        setSongList(list);
        axios.post('/api/bot/order', { list: list });
    }

    useEffect(() => {
        axios.get('/api/bot/links').then(result => {
            setSongList(result.data);
        });
        
        socket.on('songAdded', (payload) => {
            console.log(payload.message);
            setSongList(payload.updatedList);
        });

        socket.on('songRemoved', (payload) => {
            console.log(payload.message);
            setSongList(payload.updatedList);
        });



    }, []);

    const [songList, setSongList] = useState([]);

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
                        <SongList.DragHandle id={item.id} />
                        <span className={styles.songTitle}>{item.title}</span>
                        <AiOutlineCloseSquare onClick={() => removeSong(item.id)} className={styles.closeIcon} />
                    </SongList.Item>
                )}
            />
            <InputContainer />
        </div>
    );


}
