import React, { useState } from 'react';
import styles from '../Styles/InputContainer.module.css';
import axios from 'axios';


const InputContainer = () => {

    const [link, setLink] = useState('')

    const addLink = () => {
        if (!link.trim()) {
            return;
        }
        axios.post('/api/bot/addlink', { link: link.trim() });
        setLink('');    }

    const handleChange = (e: any) => {
        e.preventDefault();
        setLink(e.target.value);
    }

    const playerUpdate = (type: string) => {
        axios.get(`/api/bot/${type}`);
    }

    return (
        <div className={styles.container}>
            <label htmlFor="songName">Song</label>
            <input id="songName" name='songName' value={link} onChange={handleChange} />
            <button onClick={addLink}>Add</button>
            <div className={styles.controls}>
                <button className={styles.controlButton} onClick={() => playerUpdate('prev')}>Back</button>
                <button className={styles.controlButton} onClick={() => playerUpdate('pause')}>pause</button>
                <button className={styles.controlButton} onClick={() => playerUpdate('resume')}>play</button>
                <button className={styles.controlButton} onClick={() => playerUpdate('next')}>next</button>
                {/* <button className={styles.controlButton}>stop</button> */}
                <button className={styles.controlButton} onClick={() => playerUpdate('volumedown')}>Volume down</button>
                <button className={styles.controlButton} onClick={() => playerUpdate('volumeup')}>voume up</button>
                
            </div>

        </div>
    )
}

export default InputContainer;