import { useState } from 'react';
import styles from '../Styles/InputContainer.module.css';
import axios from 'axios';
import { LuStepBack, LuStepForward, LuPause, LuPlay, LuShuffle, LuVolume1, LuVolume2 } from "react-icons/lu";


const InputContainer = (props: any) => {

    const [link, setLink] = useState('');

    const addLink = () => {
        if (!link.trim()) {
            return;
        }
        axios.post('/api/bot/addlink', { link: link.trim() });
        setLink('');
    }

    const handleChange = (e: any) => {
        e.preventDefault();
        setLink(e.target.value);
    }

    const playerUpdate = (type: string) => {
        if(type === 'shuffle') {
            props.setShuffle(!props.shuffle);
        }
        axios.get(`/api/bot/${type}`);
    }

    // useEffect( )

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <div>
                    <label htmlFor="songName">Paste a song from youtube and hit add to add it to the playlist</label>
                    <input id="songName" className={styles.input} name='songName' value={link} onChange={handleChange} />
                    <button onClick={addLink}>Add</button>
                </div>
                <button className={styles.controlButton} onClick={() => playerUpdate('prev')}>
                    <LuStepBack />
                </button>
                <button className={styles.controlButton} onClick={() => playerUpdate('pause')}>
                    <LuPause />
                </button>
                <button className={styles.controlButton} onClick={() => playerUpdate('resume')}>
                    <LuPlay />
                </button>
                <button className={styles.controlButton} onClick={() => playerUpdate('next')}>
                    <LuStepForward />
                </button>
                {/* <button className={styles.controlButton}>stop</button> */}
                <button className={styles.controlButton} onClick={() => playerUpdate('volumedown')}>
                    <LuVolume1 />
                </button>
                <button className={styles.controlButton} onClick={() => playerUpdate('volumeup')}>
                    <LuVolume2 />
                </button>
                <button className={`${styles.controlButton} ${props.shuffle ? styles.shuffled : styles.notShuffled}`} onClick={() => playerUpdate('shuffle')}>
                    <LuShuffle />
                </button>
            </div>

        </div>
    )
}

export default InputContainer;